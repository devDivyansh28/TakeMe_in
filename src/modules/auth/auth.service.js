
import ApiError from "../../common/utils/api_error.js";
import { exportJWK , SignJWT} from "jose";

import { getPublicKey } from "../../common/utils/jose.utils.js";

import { getPrivateKey } from "../../common/utils/jose.utils.js";

import crypto from "node:crypto"

//     // , generateAccessToken ,
//     //  generateRefreshToken , verifyAcessToken , verifyRefreshToken , hashToken
//     } from "../../common/utils/jwt.utils.js";




import {User , Client ,AuthCode} from "./auth.model.js"


// import { sendVerificationEmail } from "../../common/config/email.js";

const register = async ({name,email,password,role})=>{

    const existing = await User.findOne({email})
    if(existing) throw ApiError.conflict("Email Already Exists")
    
    // const {rawToken,hashedToken} = generateVerificationToken()

    const user = await User.create({
        name,
        email,
        password,
        role,
        // verificationToken:hashedToken,
    })

    // try{
    //     await sendVerificationEmail(email,rawToken)
    // } catch (error) {
    //     console.log(error)
    // }

    const userObj = user.toObject()
    delete userObj.password
    // delete userObj.verificationToken
    return userObj
}


const login = async ({email , password , client_id , redirect_uri})=>{
    
    if(!client_id || !redirect_uri) {
        throw ApiError.unauthorized("Session Expired");
    }

    const user = await User.findOne({email}).select('+password');
    if(!user) throw ApiError.unauthorized("Invalid Email Address");
    
    const isMatch = await user.comparePassword(password);
    if(!isMatch) throw ApiError.unauthorized("Invalid Email or password");
    
    const redirection = await Client.findOne({redirect_uri});
    if(!redirection) throw ApiError.unauthorized("Invalid request");

    
    const code = crypto.randomBytes(32).toString('hex');

  
    await AuthCode.create({
        code,
        user_id : user._id,
        client_id,
        redirect_uri,
        expires_at: new Date(Date.now() + 5*60 * 1000),
        used : false
     });

     return {code , redirection};
    // const token = await new SignJWT({
    //   sub: user._id.toString(),
    //   email: user.email,
    //   given_name : user.name,
    //   role : user.role
    // })
    //   .setProtectedHeader({ alg: "RS256", kid: "key_v1" })
    //   .setIssuedAt() 
    //   .setExpirationTime("24h")
    //   .sign(await getPrivateKey());

    // return {token};
    
}

const registerClient = async ({project_Name , client_url , support_mail ,redirect_url , client_secret})=>{

    const existing = await Client.findOne({project_Name});
    if(existing) throw ApiError.conflict("Project Already Exists")

    const client = await  Client.create({
      project_Name,
      client_url,
      support_mail,
      redirect_url,
      client_secret,
    });

   const clientObj = client.toObject();

    delete clientObj.client_secret;

    return clientObj;
}



const oidcService = async ()=>{
    const services = {
      issuer: `${process.env.BASE_URL}`,
      authorization_endpoint: `${process.env.BASE_URL}/oidc/takeit`,
      token_endpoint: `${process.env.BASE_URL}/oidc/token`,
      userinfo_endpoint: `${process.env.BASE_URL}/oidc/userinfo`,
      jwks_uri: `${process.env.BASE_URL}/oidc/getPublicToken`,
    };

    return services;
}

const takeit = async () =>{

}


const handleToken = async ({code , client_id , client_secret})=>{
  // We will first verify the credential of the client
  const client = await Client.findById(client_id);
  if (!client) throw ApiError.unauthorized("Invalid Request");

  const isValidClient = await client.comparePassword(client_secret);
  if (!isValidClient) throw ApiError.unauthorized("Invalid Request");

  const authCode = await AuthCode.findOne({ code, client_id });

  if (!authCode) throw ApiError.unauthorized("Invalid Code");

  if (authCode.used) {
     await AuthCode.deleteOne({ _id: authCode._id });
     throw ApiError.unauthorized("Code already used");
  }

  if (authCode.expires_at < new Date()){
     await AuthCode.deleteOne({ _id: authCode._id });
     throw ApiError.unauthorized("Code expired");
  }

  const user = await User.findById(authCode.user_id);

  await AuthCode.updateOne({ code }, { used: true });

  const access_token = await SignJWT({
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

  await await AuthCode.deleteOne({ _id: authCode._id }); 

  return access_token;
}


const getPublicToken = async ()=>{
    
    const jwk = await exportJWK(await getPublicKey());
    
    return {
        keys : [{...jwk , use : 'sig' , alg : 'RS256' , kid : "key_v1"}]
    }
}

// const login = async ({email,password})=>{
//     // I think first work should be to find in database whether that email exist or not...
//     const user = await User.findOne({email}).select('+password')
//     if(!user) throw ApiError.unauthorized("Invalid Email and Password")
    
//     const isMatch = await user.comparePassword(password);
//     if(!isMatch) throw ApiError.unauthorized("Invalid Email or password");


//     if(!user.isVerified) throw ApiError.forbidden("Please Verify your email before login")

//     const accessToken = generateAccessToken({id: user._id , role : user.role});
//     const refreshToken = generateRefreshToken({id: user._id});
    
//     user.refreshToken = hashToken(refreshToken);

//     await user.save({validateBeforeSave:false})

//     const userObj = user.toObject();
//     delete userObj.password;
//     delete userObj.refreshToken;

//     return {user : userObj , accessToken , refreshToken}

// }

// const refresh = async (token)=>{
//       if(!token) throw ApiError.unauthorized("Refresh Token Missing...")
      
//       const decoded = verifyRefreshToken(token)

//       const user = await User.findById(decoded.id).select("+refreshToken");
//       if(!user) throw ApiError.unauthorized("User not found");
//       if(user.refreshToken !== hashToken(token)){
//         throw ApiError.unauthorized("Invalid Refresh Token")
//       }

//       const accessToken = generateAccessToken({id : user._id,role:user.role});

//       return {accessToken}
// }

// const logout = async (userId)=>{
//     // const user = await user.findById(userid);
//     // if(!user) throw ApiError.unauthorized("No user found")
//     // user.refreshToken = undefined;
//     // await user.save({validateBeforeSave:false})

//     await User.findByIdAndUpdate(userId , {
//         refreshToken : null
//     })
// }

// const forgotPassword = async (email)=>{
//    const user  = await User.findOne({email});
//    if(!user) throw ApiError.notfound("No Account with that email")

//     // const {rawToken , hashedToken} = generateResetToken();
//     user.resetPasswordToken = hashedToken;
//     user.resestPasswordExpires = Date.now()+15 * 60 * 1000;

//     await user.save();

//     // TODO : mail bhejna Nhi aata
// }

const userinfo = async (userId)=> {
   const user = await User.findById(userId);
   if(!user) throw ApiError.notFound("User not found");
   return user;
}


// const verifyEmail = async (token) =>{
//     const hashedToken = hashToken(token);

//     const user = await User.findOne({verificationToken:hashedToken}).select("+verificationToken")

//     // if User not found 

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     await user.save();
//     return user;

// };


export {register ,login  ,  oidcService , takeit , handleToken , userinfo , getPublicToken , registerClient 
    // , login , refresh , logout , forgotPassword , getMe , verifyEmail
}

//Need some more things to learn in this...
