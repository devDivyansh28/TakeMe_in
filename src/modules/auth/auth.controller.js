import * as authService from "./auth.service.js";

import ApiResponse from "../../common/utils/api_response.js";

import Joi from "joi";

const register = async (req, res) => {
  const user = await authService.register(req.body);

  ApiResponse.created(
    res,
    "Registration Successfull. Please verify your email",
    user,
  );
};


const oidc = async (req,res)=> {
  const response = await authService.oidcService();

  return res.status(200).json(response);
}

const takeit = async (req,res)=>{

}

const handleToken = async (req,res)=>{

}

const userinfo = async (req,res)=>{

}

const getPublicToken = async (req,res)=>{
    const response = await authService.getPublicToken();
    return res.status(200).json(response);
}
// const login = async (req,res)=>{
//     const {user , accessToken , refreshToken} = await authService.login(req.body)
//     res.cookie("refreshToken",refreshToken,{
//         httpOnly: true,
//         secure : true,
//         maxAge : 7*24*60*60*1000,
//     });

//     ApiResponse.ok(res,"Login successfull",{user,accessToken});
// }

// const logout = async (req,res)=>{
//     await authService.logout(req.user.id)
//     res.clearCookie("refreshToken");
//     ApiResponse.ok(res,"Logout Successfull")
// }

// const getMe = async (req,res)=>{
//     const user = await authService.getMe(req.user.id);
//     ApiResponse.ok(res,"User Profile",user);
// }

export { register , oidc , takeit , handleToken , userinfo , getPublicToken };
