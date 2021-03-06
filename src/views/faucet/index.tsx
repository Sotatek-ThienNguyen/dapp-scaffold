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

export const FaucetView = () => {
  const connection = useConnection();
  const { connected, publicKey, signMessage, adapter, signTransaction } = useWallet();

  const handleRequestAirdrop = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }

      return new Promise((resolve, reject) => {
        const actions = new Actions(connection);
        const poolProgramId = new PublicKey('2CEHzrUfZv4sBR4tGh1vRLKFqUZvSKjeNRQvVB7A1eEh');
        return actions.actionTest(publicKey, publicKey, poolProgramId, 1)
        .then(({ rawTx }) => {
          return parseAndSendTransaction(rawTx);
        })
        .then(txId => {
          resolve(txId.toString());
          console.log(txId, '-----------tx');
          
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

