declare module "@pinata/sdk" {
  interface PinataConfig {
    pinataApiKey?: string;
    pinataSecretApiKey?: string;
    pinataJWT?: string;
  }

  interface PinataMetadata {
    name?: string;
    keyvalues?: Record<string, string | number | boolean>;
  }

  interface PinataOptions {
    cidVersion?: 0 | 1;
    wrapWithDirectory?: boolean;
    customPinPolicy?: any;
  }

  interface PinataPinResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
  }

  class PinataSDK {
    constructor(config: PinataConfig);
    pinFileToIPFS(
      readableStream: any, // FormData or ReadableStream
      options?: {
        pinataMetadata?: PinataMetadata;
        pinataOptions?: PinataOptions;
      },
    ): Promise<PinataPinResponse>;
  }

  export = PinataSDK;
}
