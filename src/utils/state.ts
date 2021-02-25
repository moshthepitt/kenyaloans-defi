import { createStore } from 'react-hooks-global-state';
import { Connection } from '@solana/web3.js';
import { SOLANA_NETWORK_URL } from '../env';
import { CONNECT, DISCONNECT, SINGLE_GOSSIP, WALLET_PROVIDER_URL } from '../constants';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
const sol_adapter: any = require('@project-serum/sol-wallet-adapter');
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

export const Wallet = sol_adapter.default;
const walletAdapter = new Wallet(WALLET_PROVIDER_URL);

export type WalletType = typeof Wallet;

interface State {
  connection: Connection;
  wallet: WalletType;
}

interface WalletAction {
  payload?: WalletType;
  type: string;
}

export const reducer = (state: State, action: WalletAction): State => {
  switch (action.type) {
    case CONNECT:
      return { ...state, wallet: action.payload };
    case DISCONNECT:
      return { ...state, wallet: undefined };
    default:
      return state;
  }
};

const initialState = {
  connection: new Connection(SOLANA_NETWORK_URL, SINGLE_GOSSIP),
  wallet: walletAdapter,
};
const { dispatch, useGlobalState } = createStore(reducer, initialState);

export { dispatch, useGlobalState };
