import * as authService from "./auth.service.js";
import { Types } from "mongoose";

import ApiResponse from "../../common/utils/api_response.js";

import Joi from "joi";
import ApiError from "../../common/utils/api_error.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);

  ApiResponse.created(
    res,
    "Registration Successfull. Please verify your email",
    user,
  );
};

const registerClient = async (req, res) => {
  const client = await authService.registerClient(req.body);

  ApiResponse.created(res, "Client Registration Successfull", client);
};

const oidc = async (req, res) => {
  const response = await authService.oidcService();

  return res.status(200).json(response);
};

const handleToken = async (req, res) => {
  const { code, client_id } = req.query;
  const {client_secret} = req.body

  const access_token = await authService.handleToken({
    code,
    client_id: new Types.ObjectId(client_id),
    client_secret
  });

  return res.json({
    access_token,
    token_type: "Bearer",
    expires_in: 86400,
  });
};

const getPublicToken = async (req, res) => {
  const response = await authService.getPublicToken();
  return res.status(200).json(response);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!req.session) throw ApiError.unauthorized("Session is missing");
  const client_id = req.session.client_id;
  const redirect_uri = req.session.redirect_uri;

  const { code, redirectTo } = await authService.login({
    email,
    password,
    client_id,
    redirect_uri,
  });

  res.status(200).json({ redirectUrl: `${redirectTo}?code=${code}` });
};

const userinfo = async (req, res) => {
  const user = await authService.userinfo(req.user.id);
  ApiResponse.ok(res, "User Profile", user);
};

const clientProfile = async (req, res) => {
  const client = await authService.clientProfile(req.body);
  ApiResponse.ok(res, "Client Profile", client);
};

export {
  register,
  login,
  oidc,
  handleToken,
  userinfo,
  getPublicToken,
  registerClient,
  clientProfile,
};
