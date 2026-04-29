import ApiError from "../../common/utils/api_error.js";
// import {publicJwk} from "../../common/utils/jose.utils.js"
import { exportJWK } from "jose";
import fs from "node:fs"
import { generateVerificationToken 
    // , generateAccessToken ,
    //  generateRefreshToken , verifyAcessToken , verifyRefreshToken , hashToken
    } from "../../common/utils/jwt.utils.js";



import User from "./auth.model.js"

// import { sendVerificationEmail } from "../../common/config/email.js";

const register = async ({name,email,password,role})=>{

    const existing = await User.findOne({email})
    if(existing) throw ApiError.conflict("Email Already Exists")
    
    const {rawToken,hashedToken} = generateVerificationToken()

    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationToken:hashedToken,
    })

    try{
        await sendVerificationEmail(email,rawToken)
    } catch (error) {
        console.log(error)
    }

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.verificationToken

    return userObj
}

const oidcService = async ()=>{
    const services = {
        issuer : "http://localhost:4000",
        authorization_endpoint : "http://localhost:4000/oidc/takeIt",
        token_endpoint : "http://localhost:4000/oidc/token",
        userinfo_endpoint : "http://localhost:4000/oidc/userinfo",
        jwks_uri:"http://localhost:4000/oidc/getPublicToken"
    }

    return services;
}

const takeit = async () =>{

}

const handleToken = async ()=>{

}

const userinfo = async ()=>{

}

const getPublicToken = async ()=>{
    const publicCertificate = fs.readFileSync('../../../public.pem');
    publicCertificate = await exportJWK(publicCertificate);
    publicCertificate.alg = "RS256"
    publicCertificate.use = "sig",
    publicCertificate.kid = "key_v1"
     return {
        keys : [publicCertificate]
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

//     const {rawToken , hashedToken} = generateResetToken()
//     user.resetPasswordToken = hashedToken;
//     user.resestPasswordExpires = Date.now()+15 * 60 * 1000;

//     await user.save();

//     // TODO : mail bhejna Nhi aata
// }

// const getMe = async (userID)=> {
//    const user = await User.findById(userId);
//    if(!user) throw ApiError.notfound("User not found");
//    return user;
// }


// const verifyEmail = async (token) =>{
//     const hashedToken = hashToken(token);

//     const user = await User.findOne({verificationToken:hashedToken}).select("+verificationToken")

//     // if User not found 

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     await user.save();
//     return user;

// };


export {register , oidcService , takeit , handleToken , userinfo , getPublicToken 
    // , login , refresh , logout , forgotPassword , getMe , verifyEmail
}

//Need some more things to learn in this...
