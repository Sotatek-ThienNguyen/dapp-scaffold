import React, { useCallback } from "react";
import { useConnection } from "../../contexts/connection";
import { Connection, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmRawTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import { ConnectButton } from "./../../components/ConnectButton";
import { LABELS } from "../../constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { createTokenWithWalletAdapter } from "../../contexts/authentication/authentication";
import { Actions } from "../../contexts/actions/actions";
import { Account } from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "@project-serum/serum/lib/token-instructions";
import { sleep } from "../../contexts/actions/helper";

export const FaucetView = () => {
  const connection = useConnection();
  const { connected, publicKey, signMessage, adapter, signTransaction } = useWallet();

  const handleRequestAirdrop = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }

      const actions = new Actions(connection);
      await actions.readPool(new PublicKey('CxP4knNndD9pR1EKXjFouz4YH9VR6NqSZ793EDT7g1LH'));



      // -------------------------DEPOSIT------------------------
      // return new Promise((resolve, reject) => {
      //   console.log('---start 1');
        
      //   const actions = new Actions(connection);
      //   const POOL_CONTRACT_ADDRESS = 'GYffE8zQXCwTYwnniXVrD4ETAJGgXqfLFaPMkhvwCYCq';
      //   const poolProgramId = new PublicKey('8jsjZQTTWNqayoojyGjS2NjWEUjJgxcWvHorBhopQGWg');
      //   return actions.deposit(publicKey, publicKey, new PublicKey(POOL_CONTRACT_ADDRESS), 2)
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
      // const actions = new Actions(connection);
      // const { poolTokenXAccount, poolAccount, transaction, unsignedTransaction } = await actions.createPool(publicKey, WRAPPED_SOL_MINT, 3);
      // const signedTxWithWallet = await signTransaction!(unsignedTransaction);
      // const sign = signedTxWithWallet.signatures[0];
      // transaction.addSignature(sign.publicKey, sign.signature as Buffer);
      // await connection.sendRawTransaction(transaction.serialize(), {
      //   skipPreflight: false,
      //   preflightCommitment: 'confirmed',
      // });
      // await sleep(2000);
      // console.log('token x: ', poolTokenXAccount.publicKey.toBase58(), '--- poolAccont', poolAccount.publicKey.toString(), '---', transaction, '---', unsignedTransaction);
      // ---------------------------END OF CREATE POOL-------------------------------------------------*/

      
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
    const txId = await sendAndConfirmTransaction(transaction);
    return txId;
  }


  async function sendAndConfirmTransaction(
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

