// import { Numberu64 } from "@solana/spl-token-swap";
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import * as BufferLayout from 'buffer-layout';
import { InitPoolLayout, PoolLayout } from "./contractLayout";
import * as Layout from './layout';
import {Numberu64} from './layout';

const POOL_PROGRAM_ID = '2CEHzrUfZv4sBR4tGh1vRLKFqUZvSKjeNRQvVB7A1eEh';
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

    static async createPoolAccountInstruction(connection: Connection, payer: PublicKey) {
      const poolAccount = Keypair.generate();
      const balanceNeeded = await connection.getMinimumBalanceForRentExemption(PoolLayout.span);
  
      return {
        poolAccount,
        instruction: SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: new PublicKey(poolAccount.publicKey),
          lamports: balanceNeeded,
          space: PoolLayout.span,
          programId: new PublicKey(POOL_PROGRAM_ID),
        }),
      };
    }

    static createInitPoolInstruction(
      accounts: {
        poolAccount: PublicKey;
        authority: PublicKey;
        rootAdminAccount: PublicKey;
        tokenAccountX: PublicKey;
        payerAccount: PublicKey;
      },
      inputData: {
        nonce: number;
        fee: number
      },
    ) {
      const keys = [
        {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
        {pubkey: accounts.authority, isSigner: false, isWritable: false},
        {pubkey: accounts.tokenAccountX, isSigner: false, isWritable: false},
        {pubkey: accounts.rootAdminAccount, isSigner: false, isWritable: false},
      ];
  
      console.log('--start');
      
      const commandDataLayout = BufferLayout.struct(InitPoolLayout);
      console.log('--start2');
      let data = Buffer.alloc(1024);
      {
        const encodeLength = commandDataLayout.encode(
          {
            instruction: 0, // InitializeSwap instruction
            nonce: inputData.nonce,
            fee: inputData.fee
          },
          data,
        );
        data = data.slice(0, encodeLength);
      }
  
      return new TransactionInstruction({
        keys,
        programId: new PublicKey(POOL_PROGRAM_ID),
        data,
      });
    }

    static async createTokenAccountInstruction(
      connection: Connection,
      payerPublicKey: PublicKey,
      newAccountPubkey: PublicKey,
    ) {
      const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(connection);
      return SystemProgram.createAccount({
        fromPubkey: payerPublicKey,
        newAccountPubkey: newAccountPubkey,
        lamports: balanceNeeded,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      });
    }

    static createInitTokenAccountInstruction(
      tokenPublicKey: PublicKey,
      newTokenAccount: PublicKey,
      owner: PublicKey,
    ) {
      return Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        tokenPublicKey,
        newTokenAccount,
        owner,
      );
    }
}