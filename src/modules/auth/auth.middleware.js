import ApiError from "../../common/utils/api_error.js"; 
// import { verifyAcessToken } from "../../common/utils/jwt.utils.js";

import { jwtVerify } from "jose";


import {User }from "./auth.model.js"
import { getPublicKey } from "../../common/utils/jose.utils.js";

import { Client } from "./auth.model.js";

const authenticate = async (req, res, next) => {
  try {
    // Bug 1 fixed — added !
    const accesstoken = req.cookies?.accesstoken

    if (!accesstoken) throw ApiError.unauthorized("Please Login to access this resource");

    // Bug 2 fixed — normal function call
    const { payload } = await jwtVerify(accesstoken, await getPublicKey(), {
      algorithms: ["RS256"],
    });

    // Bug 3 fixed — correct claim name
    req.user = {
      id: payload.sub,
      email: payload.email,
      given_name: payload.given_name, // ✅
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      throw ApiError.unauthorized("Token Expired, Please Login Again");
    }
    if (error.code === "ERR_JWS_INVALID") {
      throw ApiError.unauthorized("Invalid Token, Please Login Again");
    }
    return next(error);
  }
};

const authenticateClient = async (req, res, next) => {
  try {
    
    const { client_id, redirect_uri } = req.query;

    if (!client_id || !redirect_uri) {
      throw ApiError.badRequest("Missing client_id or redirect_uri");
    }

    const client = await Client.findById(client_id).select("+client_secret");

    if (!client) {
      throw ApiError.unauthorized("Client not allowed");
    }

    if (redirect_uri !== client.redirect_uri) {
      throw ApiError.unauthorized("Invalid redirect URI");
    }

    req.session.client_id = client_id;
    req.session.redirect_uri = redirect_uri;
    // req.client = {
    //   client_name : client.client_name,
    //   app_name : client.app_name
    // }

    next();
    
  } catch (error) {
    next(error); 
  }
};

const authorize = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            throw ApiError.forbidden("You do not have permission to perform this action")
        }

        next();
    }
}

export {authenticate , authenticateClient};