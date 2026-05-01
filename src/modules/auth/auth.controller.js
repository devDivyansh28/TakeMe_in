import * as authService from "./auth.service.js";

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


const registerClient = async (req , res)=>{
  const client = await authService.registerClient(req.body);

  ApiResponse.created(
    res,
    "Client Registration Successfull",
    client
  )
}


const oidc = async (req,res)=> {
  const response = await authService.oidcService();

  return res.status(200).json(response);
}


const takeit = async (req,res)=>{
    return res.sendFile(process.cwd() + '/public/dashboard.html');
}


const handleToken = async (req,res)=>{
    const {code , client_id , client_secret} = req.body;

    const access_token = await authService.handleToken({code , client_id , client_secret});

    return res.json({
      access_token,
      token_type : 'Bearer',
      expires_in : 86400
    })
}


const getPublicToken = async (req,res)=>{
    const response = await authService.getPublicToken();
    return res.status(200).json(response);
}

const login = async (req,res)=>{
   
    const {email , password}= req.body;
    if(!req.session) throw ApiError.unauthorized("Session is missing")
    const client_id = req.session.client_id;
    const redirect_uri = req.session.redirect_uri;
    
   
    
    const {code , redirectTo} = await authService.login({email , password , client_id , redirect_uri});

    // res.cookie("accesstoken",token,{
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     maxAge : 7*24*60*60*1000,
    // });

    res.redirect(`${redirectTo}?code=${code}`);
}

// const logout = async (req,res)=>{
//     await authService.logout(req.user.id)
//     res.clearCookie("refreshToken");
//     ApiResponse.ok(res,"Logout Successfull")
// }



const userinfo = async (req,res)=>{
    const user = await authService.userinfo(req.user.id);
    ApiResponse.ok(res,"User Profile",user);
}

const clientProfile = async (req,res)=>{
  const client = await authService.clientProfile(req.body);
  ApiResponse.ok(res,"Client Profile",client);
}

// const getMe = async (req,res)=>{
//     const user = await authService.getMe(req.user.id);
//     ApiResponse.ok(res,"User Profile",user);
// }

export { register , login , oidc , takeit , handleToken , userinfo , getPublicToken , registerClient , clientProfile };
