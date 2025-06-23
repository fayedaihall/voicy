// "server only";
// import { PinataSDK } from "pinata";
// export const pinata = new PinataSDK({
//   pinataJwt: `${process.env.PINATA_JWT}`,
//   pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
// });
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function uploadToIPFS(file: File): Promise<string> {
  const upload = await pinata.upload.public.file(file);
  return upload.cid;
}
