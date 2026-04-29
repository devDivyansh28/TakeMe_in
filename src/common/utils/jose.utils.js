import { importPKCS8 , importSPKI } from "jose";

export async function getPrivateKey() {
  const pem = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");
  return await importPKCS8(pem, "RS256");
}

export async function getPublicKey() {
  const pem = process.env.PUBLIC_KEY.replace(/\\n/g, "\n");
  return await importSPKI(pem, "RS256");
}

