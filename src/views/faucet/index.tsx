import React, { useCallback } from "react";
import { useConnection } from "../../contexts/connection";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import { ConnectButton } from "./../../components/ConnectButton";
import { LABELS } from "../../constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { createTokenWithWalletAdapter } from "../../contexts/authentication/authentication";
// import { Actions, ActionsStaking, POOL_PROGRAM_ID } from "@solbank/staking-test";
import { Account } from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "@project-serum/serum/lib/token-instructions";
import { sleep } from "../../contexts/actions/helper";
import {binaryArrayToNumber} from '../../contexts/actions/helper';
import { ActionsStaking } from "src/sdk/staking-sdk/actions.staking";
import { Actions } from "src/sdk";

export const POOL_CONTRACT_ADDRESS = 'FEmYwTTdM1SrUmtYu2xZjYwDXxVRXKjKDJHe2L1siWTL';
// export const POOL_CONTRACT_ADDRESS = 'D4G9HBNhPa8upFh3gDwbFXUxiwPF1Y5izy7DMUXaDnv1';

export const FaucetView = () => {
  const connection = useConnection();
  const { connected, publicKey, signMessage, adapter, signTransaction } = useWallet();

  const handleRequestAirdrop = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }
      



      // -------------------------TEST SNAPSHOT------------------------
      // const a = await connection.getAccountInfo(new PublicKey('GjW8uy6EvXC2C4M59TqAKJpkr7Ur8zfJWDyARp4Eg1nh'));
      // return new Promise((resolve, reject) => {
      //   console.log('---start withdraw');
        
      //   const actions = new Actions(connection);
      //   const POOL_CONTRACT_ADDRESS = '3xF9j2d9ziTdVoznq3zYkspyQnDw6GEKWLFNATVNkDty';
      //   console.log("🚀 ~ file: index.tsx ~ line 250 ~ returnnewPromise ~ POOL_CONTRACT_ADDRESS", POOL_CONTRACT_ADDRESS)
      //   return actions.testSnapShot(publicKey, new PublicKey(POOL_CONTRACT_ADDRESS))
      //   .then(({ rawTx }) => {
      //     return parseAndSendTransaction(rawTx);
      //   })
      //   .then(txId => {
      //     resolve(txId.toString());
      //     console.log(txId, '-----------tx');
      //     // encode to generate txNote
          
      //   })
      //   .catch(err => {
      //     console.log({ err });
      //     if (!err.message || err.message !== 'Transaction cancelled') {
      //       reject({
      //         message: 'Error while join pool',
      //         err,
      //       });
      //     } else {
      //       reject({ message: 'Transaction cancelled' });
      //     }
      //   })
      //   .finally(() => {
      //   });
      // });

      // --------------------------------------------------------

      






      //  /*---------------------CREATE POOL--------------------------------
      const actions = new Actions(connection);
      const { poolTokenXAccount, poolTokenYAccount, poolAccount, transaction, unsignedTransaction } =
       await actions.createPool(publicKey, new PublicKey('8QFYMpK6sN3ggqwspCigBwLghrTkUeNXnwzwBTG8LZuw'), WRAPPED_SOL_MINT, publicKey);
      const signedTxWithWallet = await signTransaction!(unsignedTransaction);
      const sign = signedTxWithWallet.signatures[0];
      transaction.addSignature(sign.publicKey, sign.signature as Buffer);
      await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      await sleep(2000);
      console.log(
        'token x: ', poolTokenXAccount.publicKey.toBase58(), 
        'token y: ', poolTokenYAccount.publicKey.toBase58(), 
        '--- poolAccont', poolAccount.publicKey.toString(),
         'transaction---', transaction,
          'unsignedTransaction---', unsignedTransaction);
      // ---------------------------END OF CREATE POOL-------------------------------------------------*/

      // //  /*---------------------READ POOL--------------------------------
      // const actions = new ActionsStaking(connection);
      //  const res = await actions.readPool(new PublicKey('Gb9LukrrGzQivWKdqURUQjyQEwnLtMvozHVWd765W5QK'));
      //  console.log(res, '--poolData');
       

      // //  /*---------------------UPDATE PENALTY--------------------------------
      // const actions = new ActionsStaking(connection);
      // const { rawTx } =
      //  await actions.updatePenaltyFee(publicKey, new PublicKey('Gb9LukrrGzQivWKdqURUQjyQEwnLtMvozHVWd765W5QK'), 10, 100);
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);

      // //  /*---------------------WITHDRAW REWARD (VERIFYING)--------------------------------
      // const actions = new ActionsStaking(connection);
      // const { rawTx } =
      //  await actions.withdrawRewardByUser(publicKey, publicKey, new PublicKey(POOL_CONTRACT_ADDRESS));
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);

      // //  /*---------------------GET SOL TOKEN (VERIFYING)--------------------------------
      // const actions = new Actions(connection);
      // const { rawTx } = await actions.deposit(publicKey, publicKey, 2);
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);



      // //  /*---------------------SEND REWARD BY ADMIN (FAIL)--------------------------------
      // const actions = new ActionsStaking(connection);
      // const { rawTx } =
      //  await actions.sendRewardToStakePoolByAdmin(publicKey, publicKey, new PublicKey(POOL_CONTRACT_ADDRESS), 0.5);
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);

      // //  /*---------------------CLOSE ACCOUNT--------------------------------
      // const actions = new Actions(connection);
      // const { rawTx } =
      //  await actions.closeAssociatedTokenAccount(publicKey, publicKey, WRAPPED_SOL_MINT);
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);


      // //  /*---------------------INIT MEMBER--------------------------------
      // const actions = new ActionsStaking(connection);
      // const { rawTx } =
      //  await actions.initStakeMember(publicKey, publicKey, new PublicKey(POOL_CONTRACT_ADDRESS));
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);
    

      //  /*---------------------READ CLAIM AMOUNT --------------------------------
      // const actions = new ActionsStaking(connection);
      // const res =
      //  await actions.readMemberData(publicKey, new PublicKey(POOL_CONTRACT_ADDRESS));
      // console.log(res);

      //  /*---------------------STAKE --------------------------------
      // const actions = new ActionsStaking(connection);
      // const { rawTx } =
      //  await actions.stakeByUser(publicKey, publicKey, new PublicKey(POOL_CONTRACT_ADDRESS), 50);
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);

      //  /*---------------------UNSTAKE --------------------------------
      // const actions = new ActionsStaking(connection);
      // const { rawTx } =
      //  await actions.unStakeByUser(publicKey, publicKey, new PublicKey(POOL_CONTRACT_ADDRESS), 30);
      // const txId = await parseAndSendTransaction(rawTx);
      // console.log(txId);
      
      // ---------------------------END-------------------------------------------------*/

      
    } catch (error) {
      notify({
        message: LABELS.AIRDROP_FAIL,
        type: "error",
      });
      console.error(error);
    }
  }, [publicKey, connection]);

  async function sendSignedTransaction(conn: Connection, transaction: Buffer) {
    const signature = await conn.sendRawTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    // await sleep(5000);
    
    return signature;
  }
  
  async function parseAndSendTransaction(rawTransaction: any): Promise<string> {
    const transactionBuffer = Buffer.from(rawTransaction, 'base64');
    const transaction = Transaction.from(transactionBuffer);
    const txId = await sendAndConfirmTransactionn(transaction);
    return txId;
  }


  async function sendAndConfirmTransactionn(
    transaction: Transaction,
    ...signers: Account[]
  ): Promise<string> {
    if (publicKey) {
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      if (signers.length > 0) {
        transaction.sign(...signers);
      }
    
      if (signTransaction) {
        const signed = await signTransaction(transaction);
        const txId = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'recent',
        });
        await connection.confirmTransaction(txId);
      
        return txId;
      }
    }
  
    return '';
  }
  
  return (
    <div className="flexColumn" style={{ flex: 1 }}>
      <div>
        <div className="deposit-input-title" style={{ margin: 10 }}>
          {LABELS.FAUCET_INFO}
        </div>
        <ConnectButton type="primary" onClick={handleRequestAirdrop}>
          {LABELS.GIVE_SOL}
        </ConnectButton>
      </div>
    </div>
  );
};

