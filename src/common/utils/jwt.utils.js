import crypto from "crypto";
import jwt from "jsonwebtoken";


const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};


// const generateAccessToken = (payload)=>{
//     return jwt.sign(payload, process.env.JWT_ACCESS_SECRET , {
//         expiresIn : process.env.JWT_ACCESS_EXPIRES_IN || "15m"
//     });
// };


// const verifyAcessToken = (token)=>{
//     return jwt.verify(token,process.env.JWT_ACCESS_SECRET)
// }


// const generateRefreshToken = (payload)=>{
//     return jwt.sign(payload, process.env.JWT_REFRESH_SECRET , {
//         expiresIn : process.env.JWT_REFRESH_EXPIRES_IN || "15m"
//     });
// };


// const verifyRefreshToken = (token)=>{
//     return jwt.verify(token,process.env.JWT_VERIFY_SECRET)
// }

const hashToken = (token)=>{
    crypto.createHash("sha256").update(token).digest("hex")
}


export {
  generateVerificationToken,
//   generateAccessToken,
//   generateRefreshToken,
//   verifyAcessToken,
//   verifyRefreshToken,
  hashToken,
};