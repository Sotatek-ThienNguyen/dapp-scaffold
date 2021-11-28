// @ts-ignore
import * as BufferLayout from 'buffer-layout';
import assert from 'assert';
import BN from 'bn.js';

export const uint64 = (property = 'uint64') => {
    return BufferLayout.blob(8, property);
};

export const rate = (property = 'rate'): any => {
  return BufferLayout.blob(8, property);
};

export class Numberu64 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): Buffer {
      const a = super.toArray().reverse();
      const b = Buffer.from(a);
      if (b.length === 8) {
        return b;
      }
      assert(b.length < 8, 'Numberu64 too large');
  
      const zeroPad = Buffer.alloc(8);
      b.copy(zeroPad);
      return zeroPad;
    }
  
    /**
     * Construct a Numberu64 from Buffer representation
     */
    static fromBuffer(buffer: Buffer): Numberu64 {
      assert(buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
      return new Numberu64(
        [...buffer]
          .reverse()
          .map((i) => `00${i.toString(16)}`.slice(-2))
          .join(''),
        16,
      );
    }
}

/**
 * Layout for a public key
 */
 export const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property);
};

// export interface EncodeDecode<T> {
//   decode: (buffer: Buffer, offset?: number) => T;
//   encode: (src: T, buffer: Buffer, offset?: number) => number;
// }

// export const bool = (property = 'bool'): BufferLayout.Layout<boolean> => {
//   const layout = BufferLayout.u8(property);
//   const {encode, decode} = encodeDecode(layout);

//   const boolLayout = (layout as BufferLayout.Layout<unknown>) as BufferLayout.Layout<boolean>;

//   boolLayout.decode = (buffer: Buffer, offset: number) => {
//     const src = decode(buffer, offset);
//     return !!src;
//   };

//   boolLayout.encode = (value: boolean, buffer: Buffer, offset: number) => {
//     const src = Number(value);
//     return encode(src, buffer, offset);
//   };

//   return boolLayout;
// };

// export const encodeDecode = <T>(layout: BufferLayout.Layout<T>): EncodeDecode<T> => {
//   const decode = layout.decode.bind(layout);
//   const encode = layout.encode.bind(layout);
//   return {decode, encode};
// };