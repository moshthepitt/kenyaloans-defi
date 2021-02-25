import { createStore } from 'react-hooks-global-state';
import { CONNECT, DISCONNECT, WALLET_PROVIDER_URL } from '../constants';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
const sol_adapter: any = require('@project-serum/sol-wallet-adapter');
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

export const Wallet = sol_adapter.default;
const walletAdapter = new Wallet(WALLET_PROVIDER_URL);

export type WalletType = typeof Wallet;

interface WalletState {
  wallet: WalletType;
}

interface WalletAction {
  payload?: WalletType;
  type: string;
}

export const reducer = (state: WalletState, action: WalletAction): WalletState => {
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
const { dispatch, useGlobalState } = createStore(reducer, initialState);

export { dispatch, useGlobalState };
