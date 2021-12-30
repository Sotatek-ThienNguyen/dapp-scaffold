import React, { useCallback, useState } from "react";
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
import { Actions, ActionsStaking } from '@solbank/staking-onchain-program-sdk';

// export const POOL_CONTRACT_ADDRESS = '8u2hWyVqvJ9h3mUnkn1w4JbpENJ1JEWEE7V42U2RWcKY';
export const POOL_CONTRACT_ADDRESS = 'ChNZGUNxsuq9RD4dbNiLtnH6JHgrrH2RGca8pso5taAo';
// export const POOL_CONTRACT_ADDRESS = 'D4G9HBNhPa8upFh3gDwbFXUxiwPF1Y5izy7DMUXaDnv1';

export const FaucetView = () => {
  const connection = useConnection();
  const { connected, publicKey, signMessage, adapter, signTransaction } = useWallet();
  const [tokenX, setTokenX] = useState('8QFYMpK6sN3ggqwspCigBwLghrTkUeNXnwzwBTG8LZuw');
  const [tokenY, setTokenY] = useState(WRAPPED_SOL_MINT.toString());
  const [poolAddress, setPoolAddress] = useState('');

  const createPool = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }
      const actions = new Actions(connection);
      const { poolTokenXAccount, poolTokenYAccount, poolAccount, transaction, unsignedTransaction } =
       await actions.createPool(publicKey, new PublicKey(tokenX), new PublicKey(tokenY), publicKey);
      const signedTxWithWallet = await signTransaction!(unsignedTransaction);
      const sign = signedTxWithWallet.signatures[0];
      transaction.addSignature(sign.publicKey, sign.signature as Buffer);
      const res = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      if (res) {
        setPoolAddress(poolAccount?.publicKey.toString())
        sleep(3000);
        const actionStaking = new ActionsStaking(connection);
         const pool = await actionStaking.readPool(new PublicKey('755GtbpqVuuzVKQk4dzBznX8oDPpt17MYAmtb2oe56Yi'));
      }
      // ---------------------------END OF CREATE POOL-------------------------------------------------*/

      // //  /*---------------------READ POOL--------------------------------
    } catch (error) {
      notify({
        message: LABELS.AIRDROP_FAIL,
        type: "error",
      });
      console.error(error);
    }
  }, [publicKey, connection]);

  function handleChangeTokenX(event: any) {
    setTokenX(event.target.value);
  }

  function handleChangeTokenY(event: any) {
    setTokenY(event.target.value);
  }


  return (
    <div className="container">
      <div>
        <div className="deposit-input-title" style={{ margin: 10 }}>
          {LABELS.FAUCET_INFO}
        </div>
        <div className="thien">
          <div className="inputContainer">
            <label className="inputName">Token X Mint:</label>
            <input className="tokenMint" type="text" style={{color:"black"}} value={tokenX} onChange={handleChangeTokenX}></input>
          </div>
          <div className="inputContainer">
            <label className="inputName">Token Y Mint (SOL):</label>
            <input className="tokenMint" type="text" style={{color:"black"}} value={tokenY} onChange={handleChangeTokenY}></input>
          </div>
          <ConnectButton type="primary" onClick={createPool}>
            {LABELS.GIVE_SOL}
          </ConnectButton>
        </div>
        <hr style={{marginTop: "10px"}}></hr>
        <p>RESULT</p>
        {poolAddress ? <p>POOL ACCOUNT: {poolAddress}</p> : ''}
      </div>
    </div>
  );
};

