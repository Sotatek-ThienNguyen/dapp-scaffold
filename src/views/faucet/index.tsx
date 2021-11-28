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
import {binaryArrayToNumber} from '../../contexts/actions/helper';

export const FaucetView = () => {
  const connection = useConnection();
  const { connected, publicKey, signMessage, adapter, signTransaction } = useWallet();

  const handleRequestAirdrop = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }

      const actions = new Actions(connection);
      await actions.readPool(new PublicKey('Aqycw1YgXp1oYgEbCd8xcPePcxRLX8zon2bkET1x1XrD'));
      // const unit8 = Uint8Array.from([70, 110, 188, 1, 0, 0, 0, 0]);
      // const unit8_1 = Uint8Array.from([0, 0, 0, 0, 1, 188, 110, 70]);
      // console.log(binaryArrayToNumber(unit8), 'le----- be', binaryArrayToNumber(unit8_1));
      




      // -------------------------------TEST--------------

      // const transaction = new Transaction()

      // transaction.recentBlockhash = (
      //   await connection.getRecentBlockhash()
      // ).blockhash;
      // transaction.feePayer = publicKey;
      // let originalTx: any;
      // if (signTransaction) {
      //   originalTx = await signTransaction(transaction);
      //   console.log(originalTx.signatures[0], '-----originalTx');
      //   console.log(originalTx.signatures[0]?.publicKey.toString(), '-----originalTx pub');
      //   console.log(originalTx.signatures[0]?.signature?.toString(), '-----originalTx sign');
        
      // }

      // const serializedTx = originalTx.serialize();
      // console.log({serializedTx: serializedTx.toString('base64')});

      // const recoverTx = Transaction.from(
      //   Buffer.from(serializedTx.toString(), 'base64'),
      // );
      // console.dir(recoverTx, '---recoverTx');
      // console.log(recoverTx.signatures[0]?.publicKey?.toString(), '---recoverTx pub');
      // console.log(recoverTx.signatures[0].signature?.toString(), '---recoverTx sig');
      // console.log(recoverTx.signatures[0].signature as any, '---recoverTx sig');
      
      // const signatureOk = recoverTx.verifySignatures();
      // console.log({signatureOk});







      // ------------------------------------------------------
      // -------------------------DEPOSIT------------------------
      return new Promise((resolve, reject) => {
        console.log('---start 1');
        
        const actions = new Actions(connection);
        const POOL_CONTRACT_ADDRESS = 'Aqycw1YgXp1oYgEbCd8xcPePcxRLX8zon2bkET1x1XrD';
        const poolProgramId = new PublicKey('8jsjZQTTWNqayoojyGjS2NjWEUjJgxcWvHorBhopQGWg');
        let serializedTx: any;
        return actions.deposit(publicKey, publicKey, new PublicKey(POOL_CONTRACT_ADDRESS), 1.03)
        .then(({ rawTx, unsignedTransaction }) => {
          serializedTx = rawTx
          return parseAndSendTransaction(rawTx);
        })
        .then(txId => {
          resolve(txId.toString());
          console.log(txId, '-----------tx');
          // encode to generate txNote

          const recoverTx = Transaction.from(
            Buffer.from(serializedTx.toString(), 'base64'),
          );
          console.log(recoverTx.signatures, '------------');
          const signatureOk = recoverTx.verifySignatures();
        console.log({signatureOk});
          
        })
        .catch(err => {
          console.log({ err });
          if (!err.message || err.message !== 'Transaction cancelled') {
            reject({
              message: 'Error while join pool',
              err,
            });
          } else {
            reject({ message: 'Transaction cancelled' });
          }
        })
        .finally(() => {
        });
      });

      // --------------------------------------------------------



      // -------------------------WITHDRAW------------------------
      // return new Promise((resolve, reject) => {
      //   console.log('---start withdraw');
        
      //   const actions = new Actions(connection);
      //   const POOL_CONTRACT_ADDRESS = 'Aqycw1YgXp1oYgEbCd8xcPePcxRLX8zon2bkET1x1XrD';
      //   const poolProgramId = new PublicKey('8jsjZQTTWNqayoojyGjS2NjWEUjJgxcWvHorBhopQGWg');
      //   const withdrawAddress = new PublicKey('53MYtfWHdBWYR7WSjPkmcKYUiuTgbNi1QjiYuygWKXNh');
      //   return actions.withdraw(publicKey, withdrawAddress, new PublicKey(POOL_CONTRACT_ADDRESS), 0.2)
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

