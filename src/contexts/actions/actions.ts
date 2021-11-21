import {WRAPPED_SOL_MINT} from '@project-serum/serum/lib/token-instructions';
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Instructions } from './instructions';

const POOL_PROGRAM_ID = '2CEHzrUfZv4sBR4tGh1vRLKFqUZvSKjeNRQvVB7A1eEh';
export class Actions {
    private connection: Connection;

    constructor(connection: Connection) {
      this.connection = connection;
    }

    public async actionTest(payer: PublicKey, userAddress: PublicKey, poolProgramId: PublicKey, amount: number) {
      const {blockhash} = await this.connection.getRecentBlockhash();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: payer,
      });

      transaction.add(
        Instructions.createTestInstruction(
          {
            userAccount: userAddress
          },
          {
            incoming_amount: amount
          },
          poolProgramId
        )
      );

      const rawTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
  
      return {
        rawTx,
        unsignedTransaction: transaction,
      };
    }

    // public async earlyJoin(
    //     payer: PublicKey,
    //     userAddress: PublicKey,
    //     poolAddress: PublicKey,
    //     amount: number,
    //   ) {
    //     const {blockhash} = await this.connection.getRecentBlockhash();
    //     const transaction = new Transaction({
    //       recentBlockhash: blockhash,
    //       feePayer: payer,
    //     });
    //     const poolProgramId = await this.getPoolProgramId(poolAddress);
    //     const {token_x} = await this.readPool(poolAddress);
    //     const authority = await this.findPoolAuthority(poolAddress);
    //     const wrappedUserAddress = await this.findAssociatedTokenAddress(userAddress, WRAPPED_SOL_MINT);
    //     const {
    //       exists: isExisted,
    //       associatedAddress: poolMemberAccount,
    //     } = await this.getPoolAssociatedAccountInfo(userAddress, poolAddress);
    
    //     if (!isExisted) {
    //       // create joined user data if not exists
    //       transaction.add(
    //         Instructions.createAssociatedPoolAccountInstruction(
    //           payer,
    //           new PublicKey(userAddress),
    //           new PublicKey(poolAddress),
    //           new PublicKey(poolMemberAccount),
    //           poolProgramId,
    //         ),
    //       );
    //     }
    
    //     const txFee = await this.getLamportPerSignature(blockhash);
    //     const rentFee = await this.connection.getMinimumBalanceForRentExemption(AccountLayout.span);
    
    //     transaction.add(
    //       SystemProgram.transfer({
    //         fromPubkey: userAddress,
    //         toPubkey: wrappedUserAddress,
    //         lamports: amount * LAMPORTS_PER_SOL + rentFee,
    //       }),
    //       Instructions.createAssociatedTokenAccountInstruction(
    //         payer,
    //         userAddress,
    //         WRAPPED_SOL_MINT,
    //         wrappedUserAddress,
    //       ),
    //       Instructions.createApproveInstruction({
    //         programId: TOKEN_PROGRAM_ID,
    //         source: wrappedUserAddress,
    //         delegate: authority,
    //         owner: userAddress,
    //         amount: amount * LAMPORTS_PER_SOL + rentFee,
    //         signers: [userAddress],
    //       }),
    //       Instructions.createEarlyJoinPoolInstruction(
    //         {
    //           poolAccount: poolAddress,
    //           userAuthority: authority,
    //           userAccount: userAddress,
    //           poolMemberAccount,
    //           userSourceTokenAccount: wrappedUserAddress,
    //           poolSourceTokenAccount: new PublicKey(token_x),
    //           tokenProgramId: TOKEN_PROGRAM_ID,
    //         },
    //         {
    //           incoming_amount: amount * LAMPORTS_PER_SOL,
    //         },
    //         poolProgramId,
    //       ),
    //       Instructions.closeAccountInstruction({
    //         programId: TOKEN_PROGRAM_ID,
    //         account: wrappedUserAddress,
    //         dest: userAddress,
    //         owner: userAddress,
    //         signers: [],
    //       }),
    //     );
    
    //     const rawTx = transaction.serialize({
    //       requireAllSignatures: false,
    //       verifySignatures: false,
    //     });
    
    //     return {
    //       rawTx,
    //       txFee,
    //       unsignedTransaction: transaction,
    //     };
    // }

    public async getPoolProgramId(poolAddress: PublicKey): Promise<PublicKey> {
        return this.getOwner(poolAddress);
    }
    
    public async getOwner(address: PublicKey): Promise<PublicKey> {
        const pool_acc = await this.connection.getAccountInfo(new PublicKey(address));
        if (!pool_acc?.data) {
            throw new Error(`Invalid address`);
        }

        return new PublicKey(pool_acc.owner);
    }

    async readPool(
        poolAddress: PublicKey,
        tokenDecimalsInput?: number,
        tokenToDecimalsInput?: number,
      ) {
        // const accountInfo = await this.connection.getAccountInfo(poolAddress);
        // if (!accountInfo) {
        //   throw new Error('Can not find pool address');
        // }

        // const result = PoolLayout.decode(Buffer.from(accountInfo.data));
    
        // return {
        //   is_initialized: result.is_initialized,
        //   nonce: result.nonce,
        //   id: Buffer.from(result.pool_id).toString(),
        //   token_x: new PublicKey(result.token_x).toString(),
        //   token_y: new PublicKey(result.token_y).toString(),
        // };
    }

    async createPool(payer: PublicKey, tokenX: PublicKey, fee: number) {
      const recentBlockhash = await this.connection.getRecentBlockhash();
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: payer,
      });

      const {poolAccount, instruction} = await Instructions.createPoolAccountInstruction(this.connection,payer);
      transaction.add(instruction);
      const programId = new PublicKey(POOL_PROGRAM_ID);
      const [poolAuthority, nonce] = await PublicKey.findProgramAddress(
        [poolAccount.publicKey.toBuffer()],
        programId,
      );
      const poolTokenXAccount = Keypair.generate();

      transaction.add(
        await Instructions.createTokenAccountInstruction(
          this.connection,
          payer,
          poolTokenXAccount.publicKey,
        ),
        Instructions.createInitTokenAccountInstruction(
          tokenX,
          poolTokenXAccount.publicKey,
          poolAuthority,
        ),
        
        Instructions.createInitPoolInstruction(
          {
            poolAccount: poolAccount.publicKey,
            authority: poolAuthority,
            rootAdminAccount: payer,
            tokenAccountX: poolTokenXAccount.publicKey,
            payerAccount: payer,
          },
          {
            fee,
            nonce,
          },
        ),
      );

      const unsignedTransaction = Transaction.from(
        transaction.serialize({
          verifySignatures: false,
          requireAllSignatures: false,
        }),
      );
      const unsignedData = transaction.compileMessage().serialize();
      transaction.sign(poolAccount, poolTokenXAccount);

      return {
        unsignedTransaction,
        unsignedData,
        transaction,
        poolAccount,
        poolTokenXAccount,
      };
    }

      
}