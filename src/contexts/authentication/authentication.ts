import { PublicKey} from '@solana/web3.js';
import {IPayload, IPayloadWithSignature} from './authentication.interface';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

export const expiredTime = 1 * 60 * 60 * 1000; // 1 hour

export const createPayload = (address: PublicKey): IPayload => {
  const now = new Date().getTime();
  return {
    address: address.toString(),
    iat: now,
    exp: now + expiredTime,
  };
};

export const createTokenWithWalletAdapter = async (publicKey: PublicKey, signMessage?: (message: Uint8Array) => Promise<Uint8Array>): Promise<string> => {
  let token = '';
  if (publicKey) {
      try {
        const payload = createPayload(publicKey);
        if (payload) {
          if (signMessage) {
            const signatureUint8 = await signMessage(Buffer.from(JSON.stringify(payload)));
            const signAuth = new TextDecoder("utf-8").decode(signatureUint8);
            console.log(signAuth, '-----sin', signatureUint8);
            
            const signedData = {
              ...payload,
              signature: Buffer.from(signatureUint8).toString('hex'),
            };
            token = bs58.encode(Buffer.from(JSON.stringify(signedData)));
            console.log(token, '------token', payload);
          }
        }
      } catch (e) {
        console.log(e, '----err');
      }
    }
    return token;
};

export const decodeToken = (token: string): IPayloadWithSignature => {
  return JSON.parse(bs58.decode(token).toString()) as IPayloadWithSignature;
};

export const verifyAndDecode = (
  token: string,
): {isValid: boolean; isExpired?: boolean; data?: IPayloadWithSignature; error?: any} => {
  try {
    const payloadWithSig = decodeToken(token);
    const {iat, exp, address, signature} = payloadWithSig;
    const payload = {
      address,
      iat,
      exp,
    };
    return {
      isValid: nacl.sign.detached.verify(
        Buffer.from(JSON.stringify(payload)),
        Buffer.from(signature, 'hex'),
        new PublicKey(payload.address).toBuffer(),
      ),
      isExpired: exp < new Date().getTime(),
      data: payloadWithSig,
    };
  } catch (error) {
    return {
      isValid: false,
      error,
    };
  }
};
