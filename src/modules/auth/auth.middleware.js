import ApiError from "../../common/utils/api_error.js"; 
// import { verifyAcessToken } from "../../common/utils/jwt.utils.js";

import { jwtVerify } from "jose";


import User from "./auth.model.js"
import { getPublicKey } from "../../common/utils/jose.utils.js";

const authenticate = async (req, res, next) => {
  try {
    // Bug 1 fixed — added !
    const accesstoken = req.cookies?.accesstoken;
    if (!accesstoken) throw ApiError.unauthorized("No token provided");

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
      return next(ApiError.unauthorized("Token has expired"));
    }
    if (error.code === "ERR_JWS_INVALID") {
      return next(ApiError.unauthorized("Invalid Token"));
    }
    return next(error);
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

export {authenticate , authorize};