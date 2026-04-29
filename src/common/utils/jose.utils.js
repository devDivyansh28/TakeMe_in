import { generateKeyPair, exportJWK, exportPKCS8, exportSPKI } from "jose";
import fs from "node:fs"
import path from "node:path";


export const generatePair = async ()=>{
    const {publicKey , privateKey}= await generateKeyPair("RS256");

     return {publicKey , privateKey}
     }


const {publicKey , privateKey} = await generatePair();


// export const publicJwk = await exportJWK(publicKey); 
// export const privateJwk = await exportJWK(privateKey); 

const privatePem = await exportPKCS8(privateKey);
const publicPem = await exportSPKI(publicKey);

fs.writeFileSync("../../../private.pem", privatePem);
fs.writeFileSync("../../../public.pem", publicPem);

