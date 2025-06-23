import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const response = await pinata.upload.public.file(file);

    return NextResponse.json({ ipfsHash: response.cid });
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
