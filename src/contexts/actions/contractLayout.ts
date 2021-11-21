import * as BufferLayout from 'buffer-layout';
// tslint:disable-next-line:no-duplicate-imports
import * as Layout from './layout';

export const PoolLayout = BufferLayout.struct([
    BufferLayout.u8('nonce'),
    Layout.publicKey('token_x'),
    Layout.publicKey('admin'),
    Layout.publicKey('root_admin'),
    BufferLayout.nu64('fee_amount'),
    Layout.rate('fees'),
]);

export const InitPoolLayout = [
    BufferLayout.u8('instruction'),
    BufferLayout.u8('nonce'),
    Layout.publicKey('token_x'),
    Layout.rate('fees'),
];