import ApiError from "../../common/utils/api_error.js";
import { exportJWK, SignJWT } from "jose";

import { getPublicKey } from "../../common/utils/jose.utils.js";

import { getPrivateKey } from "../../common/utils/jose.utils.js";

import crypto from "node:crypto";

import { User, Client, AuthCode } from "./auth.model.js";

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("Email Already Exists");

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const userObj = user.toObject();
  delete userObj.password;
  // delete userObj.verificationToken
  return userObj;
};

const login = async ({ email, password, client_id, redirect_uri }) => {
  if (!client_id || !redirect_uri) {
    throw ApiError.unauthorized("Session Expired");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid Email Address");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid Email or password");

  const redirection = await Client.findOne({ redirect_uri });
  if (!redirection) throw ApiError.unauthorized("Invalid request");

  const code = crypto.randomBytes(32).toString("hex");

  await AuthCode.create({
    code,
    user_id: user._id,
    client_id,
    redirect_uri,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
    used: false,
  });

  const redirectTo = redirection.redirect_uri;

  return { code, redirectTo };
};



const registerClient = async ({
  client_mail,
  project_Name,
  client_uri,
  support_mail,
  redirect_uri,
  client_secret,
}) => {
  const existing = await Client.findOne({ project_Name });
  if (existing) throw ApiError.conflict("Project Already Exists");

  const client = await Client.create({
    client_mail,
    project_Name,
    client_uri,
    support_mail,
    redirect_uri,
    client_secret,
  });

  const clientObj = client.toObject();

  delete clientObj.client_secret;

  return clientObj;
};

const oidcService = async () => {
  const services = {
    issuer: `${process.env.BASE_URL}`,
    authorization_endpoint: `${process.env.BASE_URL}/oidc/takeit`,
    token_endpoint: `${process.env.BASE_URL}/oidc/token`,
    userinfo_endpoint: `${process.env.BASE_URL}/oidc/userinfo`,
    jwks_uri: `${process.env.BASE_URL}/oidc/getPublicToken`,
  };

  return services;
};


const handleToken = async ({ code, client_id ,client_secret }) => {
 
  const client = await Client.findById(client_id).select('+client_secret');

  if (!client) throw ApiError.unauthorized("Invalid Request");

  const isValidClient = await client.comparePassword(client_secret);

  if (!isValidClient) throw ApiError.unauthorized("Invalid Request");

  const authCode = await AuthCode.findOne({ code });

  if (!authCode || !authCode.client_id.equals(client_id))
    throw ApiError.unauthorized("Invalid Code");

  if (authCode.used) {
    await AuthCode.deleteOne({ _id: authCode._id });
    throw ApiError.unauthorized("Code already used");
  }

  if (authCode.expires_at < new Date()) {
    await AuthCode.deleteOne({ _id: authCode._id });
    throw ApiError.unauthorized("Code expired");
  }

  const user = await User.findById(authCode.user_id);

  const access_token = await new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    given_name: user.name,
    role: user.role,
    client_id,
  })
    .setProtectedHeader({ alg: "RS256", kid: "key_v1" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(await getPrivateKey());

  await AuthCode.deleteOne({ _id: authCode._id });

  return access_token;
};


const getPublicToken = async () => {
  const jwk = await exportJWK(await getPublicKey());

  return {
    keys: [{ ...jwk, use: "sig", alg: "RS256", kid: "key_v1" }],
  };
};


const clientProfile = async ({ client_mail, client_secret }) => {
  const client = await Client.findOne({ client_mail }).select("+client_secret");
  if (!client) throw ApiError.unauthorized("Client not registered");

  const isValid = await client.comparePassword(client_secret);
  if (!isValid) throw ApiError.unauthorized("Invalid credentials");

  const clientObj = client.toObject();
  delete clientObj.client_secret;
  return clientObj;
};

const userinfo = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

export {
  register,
  login,
  oidcService,
  handleToken,
  userinfo,
  getPublicToken,
  registerClient,
  clientProfile
};
