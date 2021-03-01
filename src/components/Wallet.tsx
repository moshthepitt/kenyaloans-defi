import React, { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@blueprintjs/core';
import { CONNECT, DISCONNECT, WALLET, WALLET_PROVIDER_URL } from '../constants';
import { dispatch, useGlobalState, Wallet } from '../utils/state';
import { SOLANA_NETWORK_URL } from '../env';

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
  network: SOLANA_NETWORK_URL,
};

WalletConnection.defaultProps = defaultProps;
