// import { Numberu64 } from "@solana/spl-token-swap";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import * as BufferLayout from 'buffer-layout';
import * as Layout from './layout';
import {Numberu64} from './layout';

export class Instructions {
    static createDepositInstruction(
        accounts: {
          poolAccount: PublicKey;
          userAccount: PublicKey;
        },
        inputData: {
          incoming_amount: number;
        },
        poolProgramId: PublicKey,
      ): TransactionInstruction {
        const {
          poolAccount,
          userAccount
        } = accounts;
        const keys = [
          {pubkey: poolAccount, isSigner: false, isWritable: true},
          {pubkey: userAccount, isSigner: true, isWritable: true},
        ];
    
        const commandDataLayout = BufferLayout.struct([
          BufferLayout.u8('instruction'),
          Layout.uint64('incoming_amount'),
        ]);
    
        let data = Buffer.alloc(1024);
        {
          const encodeLength = commandDataLayout.encode(
            {
              instruction: 4, // Early Join Pool instruction
              incoming_amount: new Numberu64(inputData.incoming_amount).toBuffer(),
            },
            data,
          );
          data = data.slice(0, encodeLength);
        }
    
        return new TransactionInstruction({
          keys,
          programId: poolProgramId,
          data,
        });
    }

    static createTestInstruction(
      accounts: {
        userAccount: PublicKey;
      },
      inputData: {
        incoming_amount: number;
      },
      poolProgramId: PublicKey,
    ): TransactionInstruction {
      const {
        userAccount
      } = accounts;
      const keys = [
        {pubkey: userAccount, isSigner: true, isWritable: true},
      ];
  
      const commandDataLayout = BufferLayout.struct([
        BufferLayout.u8('instruction'),
        Layout.uint64('incoming_amount'),
      ]);
  
      let data = Buffer.alloc(1024);
      {
        const encodeLength = commandDataLayout.encode(
          {
            instruction: 1, // Early Join Pool instruction
            incoming_amount: new Numberu64(inputData.incoming_amount).toBuffer(),
          },
          data,
        );
        data = data.slice(0, encodeLength);
      }
  
      return new TransactionInstruction({
        keys,
        programId: poolProgramId,
        data,
      });
    }
}