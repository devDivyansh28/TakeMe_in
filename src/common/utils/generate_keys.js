import { generateKeyPair , exportPKCS8 ,exportSPKI } from "jose";

const generatekeys = async ()=>{
    const {privateKey , publicKey} = await generateKeyPair("RS256" , {extractable : true});
   console.log(
     'PRIVATE_KEY="' +
       (await exportPKCS8(privateKey)).replace(/\n/g, "\\n") +
       '"',
   );
   console.log(
     'PUBLIC_KEY="' + (await exportSPKI(publicKey)).replace(/\n/g, "\\n") + '"',
   );
}

generatekeys();