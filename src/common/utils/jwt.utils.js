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




const hashToken = (token)=>{
    crypto.createHash("sha256").update(token).digest("hex")
}


export {
  generateVerificationToken,
  hashToken,
};