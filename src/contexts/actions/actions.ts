import {WRAPPED_SOL_MINT} from '@project-serum/serum/lib/token-instructions';
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token';
import Decimal from 'decimal.js';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { PoolLayout } from './contractLayout';
import { Instructions } from './instructions';
import { IExtractPoolData } from './interface';

const POOL_PROGRAM_ID = '8jsjZQTTWNqayoojyGjS2NjWEUjJgxcWvHorBhopQGWg';
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

    public async getLamportPerSignature(blockhash: any): Promise<number> {
      const feeCalculator = await this.connection.getFeeCalculatorForBlockhash(blockhash);
  
      const lamportsPerSignature =
        feeCalculator && feeCalculator.value ? feeCalculator.value.lamportsPerSignature : 0;
  
      return lamportsPerSignature;
    }

    public async deposit(
        payer: PublicKey,
        userAddress: PublicKey,
        poolAddress: PublicKey,
        amount: number,
      ) {
        const {blockhash} = await this.connection.getRecentBlockhash();
        const transaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: payer,
        });
        const poolProgramId = await this.getPoolProgramId(poolAddress);
        const {token_x} = await this.readPool(poolAddress);
        const authority = await this.findPoolAuthority(poolAddress);
        const wrappedUserAddress = await this.findAssociatedTokenAddress(userAddress, WRAPPED_SOL_MINT);
   
        const txFee = await this.getLamportPerSignature(blockhash);
        const rentFee = await this.connection.getMinimumBalanceForRentExemption(AccountLayout.span);
    
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userAddress,
            toPubkey: wrappedUserAddress,
            lamports: amount * LAMPORTS_PER_SOL + rentFee,
          }),
          Instructions.createAssociatedTokenAccountInstruction(
            payer,
            userAddress,
            WRAPPED_SOL_MINT,
            wrappedUserAddress,
          ),
          Instructions.createApproveInstruction({
            programId: TOKEN_PROGRAM_ID,
            source: wrappedUserAddress,
            delegate: authority,
            owner: userAddress,
            amount: amount * LAMPORTS_PER_SOL + rentFee,
            signers: [userAddress],
          }),
          Instructions.deposit(
            {
              poolAccount: poolAddress,
              userAuthority: authority,
              userAccount: userAddress,
              userSourceTokenAccount: wrappedUserAddress,
              poolSourceTokenAccount: new PublicKey(token_x),
              tokenProgramId: TOKEN_PROGRAM_ID,
            },
            {
              incoming_amount: amount * LAMPORTS_PER_SOL,
            },
            poolProgramId,
          ),
          Instructions.closeAccountInstruction({
            programId: TOKEN_PROGRAM_ID,
            account: wrappedUserAddress,
            dest: userAddress,
            owner: userAddress,
            signers: [],
          }),
        );
    
        const rawTx = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });
    
        return {
          rawTx,
          txFee,
          unsignedTransaction: transaction,
        };
    }

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

    async findPoolAuthority(poolAddress: PublicKey): Promise<PublicKey> {
      const programId = await this.getPoolProgramId(poolAddress);
      const [authority] = await PublicKey.findProgramAddress([poolAddress.toBuffer()], programId);
      return authority;
    }

     /**
   * Get associated address of target address and can mint token
   *
   * @param targetAddress PublicKey (target address need to find associated)
   * @param tokenMintAddress PublicKey (token can be mint by associated address)
   * @returns Promise<PublicKey>
   */
  async findAssociatedTokenAddress(
    targetAddress: PublicKey,
    tokenMintAddress: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [targetAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )
    )[0];
  }

    async readPool(
        poolAddress: PublicKey
      ): Promise<IExtractPoolData> {
        const accountInfo = await this.connection.getAccountInfo(poolAddress);
        if (!accountInfo) {
          throw new Error('Can not find pool address');
        }
        console.log(accountInfo, '----account info');
        
        const result = PoolLayout.decode(Buffer.from(accountInfo.data));
        
        const poolData = {
          nonce: result.nonce,
          root_admin: new PublicKey(result.root_admin).toString(),
          admin: new PublicKey(result.admin).toString(),
          token_x: new PublicKey(result.token_x).toString(),
          fee_amount: new Decimal(result.fee_amount).toNumber(),
          fee: new Decimal(result.fee).toNumber(),
        }
        console.log(result.fee, '-----fee', new Decimal(result.fee).toNumber());
        

        console.log(poolData, '---poolData');
        return poolData;
        
        
    
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
      console.log(nonce, '-----nonce-------');
      
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