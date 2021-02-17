import React, { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createStore } from 'react-hooks-global-state';
import { Button } from '@blueprintjs/core';
import { CONNECT, DISCONNECT, TESTNET, WALLET_PROVIDER_URL } from '../constants';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
const sol_adapter: any = require('@project-serum/sol-wallet-adapter');
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

const Wallet = sol_adapter.default;
const walletAdapter = new Wallet(WALLET_PROVIDER_URL);

interface WalletState {
  wallet: typeof Wallet;
}

interface WalletAction {
  payload?: typeof Wallet;
  type: string;
}

export const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case CONNECT:
      return { ...state, wallet: action.payload };
    case DISCONNECT:
      return { ...state, wallet: undefined };
    default:
      return state;
  }
};

const initialState = { wallet: walletAdapter };
const { dispatch, useGlobalState } = createStore(walletReducer, initialState);

export const WalletConnection = (): JSX.Element => {
  const network = TESTNET;
  const urlWallet = useMemo(() => new Wallet(WALLET_PROVIDER_URL, network), [
    WALLET_PROVIDER_URL,
    network,
  ]);

  urlWallet.on(CONNECT, (_: PublicKey) => {
    dispatch({ payload: urlWallet, type: CONNECT });
    return;
  });
  urlWallet.on(DISCONNECT, () => {
    dispatch({ type: DISCONNECT });
    return;
  });

  return (
    <div>
      <div>
        <Button icon="power" small={true} onClick={async () => await urlWallet.connect()}>
          Connect to Wallet
        </Button>{' '}
        <Button icon="delete" small={true} onClick={async () => await urlWallet.disconnect()}>
          Disconnect from Wallet
        </Button>
      </div>
    </div>
  );
};

export { useGlobalState as useWalletGlobalState };
