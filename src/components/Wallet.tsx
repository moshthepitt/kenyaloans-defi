import React, { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createStore } from 'react-hooks-global-state';
import { Button } from '@blueprintjs/core';
import { CONNECT, DISCONNECT, TESTNET, WALLET, WALLET_PROVIDER_URL } from '../constants';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
const sol_adapter: any = require('@project-serum/sol-wallet-adapter');
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

const Wallet = sol_adapter.default;
const walletAdapter = new Wallet(WALLET_PROVIDER_URL);

export type WalletType = typeof Wallet;

interface WalletState {
  wallet: WalletType;
}

interface WalletAction {
  payload?: WalletType;
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

interface ConnectionProps {
  network: string;
}

export const WalletConnection = (props: ConnectionProps): JSX.Element => {
  const { network } = props;
  const [wallet] = useGlobalState(WALLET);
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
        {wallet && wallet._publicKey ? (
          <Button
            icon="delete"
            intent="danger"
            minimal={true}
            small={true}
            onClick={async () => await urlWallet.disconnect()}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            icon="power"
            intent="primary"
            minimal={true}
            small={true}
            onClick={async () => await urlWallet.connect()}
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

const defaultProps: ConnectionProps = {
  network: TESTNET,
};

WalletConnection.defaultProps = defaultProps;

export { useGlobalState as useWalletGlobalState };
