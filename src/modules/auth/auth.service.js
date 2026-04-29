
import ApiError from "../../common/utils/api_error.js";
import { exportJWK , SignJWT} from "jose";

import { getPublicKey } from "../../common/utils/jose.utils.js";

import { getPrivateKey } from "../../common/utils/jose.utils.js";

// import { generateVerificationToken 
//     // , generateAccessToken ,
//     //  generateRefreshToken , verifyAcessToken , verifyRefreshToken , hashToken
//     } from "../../common/utils/jwt.utils.js";




import {User , Client} from "./auth.model.js"

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

const login = async ({email , password})=>{
    const user = await User.findOne({email}).select('+password');
    if(!user) throw ApiError.unauthorized("Invalid Email Address");

    const isMatch = await user.comparePassword(password);
    if(!isMatch) throw ApiError.unauthorized("Invalid Email or password");

    const token = await new SignJWT({
      sub: user._id.toString(),
      email: user.email,
      given_name : user.name,
      role : user.role
    })
      .setProtectedHeader({ alg: "RS256", kid: "key_v1" })
      .setIssuedAt() 
      .setExpirationTime("24h")
      .sign(await getPrivateKey());

    return {token};
    
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

//     const {rawToken , hashedToken} = generateResetToken()
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
