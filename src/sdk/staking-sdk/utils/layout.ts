// @ts-ignore
import * as BufferLayout from 'buffer-layout';
import * as assert from 'assert';
import * as BN from 'bn.js';

/**
 * Layout for a public key
 */
export const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for snapshot history
 */
export const snapshotHistory = (property = 'snapshot_history'): any => {
  return BufferLayout.blob(24, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const int64 = (property = 'int64') => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 128bit unsigned value
 */
export const uint128 = (property = 'uint128') => {
  return BufferLayout.blob(16, property);
};

/**
 * Layout for a Rust String type
 */
export const rustString = (property = 'string') => {
  const rsl = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property,
  );
  const _decode = rsl.decode.bind(rsl);
  const _encode = rsl.encode.bind(rsl);

  rsl.decode = (buffer: Buffer, offset: number) => {
    const data = _decode(buffer, offset);
    return data.chars.toString('utf8');
  };

  rsl.encode = (str: string, buffer: Buffer, offset: number) => {
    const data = {
      chars: Buffer.from(str, 'utf8'),
    };
    return _encode(data, buffer, offset);
  };

  return rsl;
};


export interface EncodeDecode<T> {
  decode: (buffer: Buffer, offset?: number) => T;
  encode: (src: T, buffer: Buffer, offset?: number) => number;
}

export const encodeDecode = <T>(layout: BufferLayout.Layout<T>): EncodeDecode<T> => {
  const decode = layout.decode.bind(layout);
  const encode = layout.encode.bind(layout);
  return {decode, encode};
};

export const bool = (property = 'bool'): BufferLayout.Layout<boolean> => {
  const layout = BufferLayout.u8(property);
  const {encode, decode} = encodeDecode(layout);

  const boolLayout = (layout as BufferLayout.Layout<unknown>) as BufferLayout.Layout<boolean>;

  boolLayout.decode = (buffer: Buffer, offset: number) => {
    const src = decode(buffer, offset);
    return !!src;
  };

  boolLayout.encode = (value: boolean, buffer: Buffer, offset: number) => {
    const src = Number(value);
    return encode(src, buffer, offset);
  };

  return boolLayout;
};


export function getAlloc(type: any, fields: any): number {
  let alloc = 0;
  type.layout.fields.forEach((item: any) => {
    if (item.span >= 0) {
      alloc += item.span;
    } else if (typeof item.alloc === 'function') {
      alloc += item.alloc(fields[item.property]);
    }
  });
  return alloc;
}

/**
 * Layout for a 144bit unsigned value
 *
 * @param property string
 * @returns any
 */
export const poolId = (property = 'uint144'): any => {
  return BufferLayout.blob(18, property);
};

export const rate = (property = 'rate'): any => {
  return BufferLayout.blob(16, property);
};

export const fees = (property = 'fees'): any => {
  return BufferLayout.blob(16, property);
};

export const seeds = (property = 'seeds'): any => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for campaign
 *
 * @param property string
 * @returns Object
 */
export const campaign = (property = 'campaign'): any => {
  return BufferLayout.blob(130, property);
};

/**
 * Layout for admins
 *
 * @param property string
 * @returns Object
 */
export const admins = (property = 'admins'): any => {
  return BufferLayout.blob(32, property);
};

export const poolPhase = (property = 'poolPhase'): any => {
  return BufferLayout.blob(49, property);
};

export const userLevel = (property = 'userLevel'): any => {
  return BufferLayout.blob(9, property);
};

export const tier = (property = 'tier'): any => {
  return BufferLayout.blob(24, property);
};
