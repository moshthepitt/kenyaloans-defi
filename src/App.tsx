/* eslint-disable no-console, no-debugger, @typescript-eslint/no-unused-vars */
import React from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import { useWalletGlobalState, WalletConnection } from './components/Wallet';
import { WALLET } from './constants';

import '@blueprintjs/core/lib/css/blueprint.css';
import 'milligram/dist/milligram.css';

/**
 * Main app
 */
export default function App(): JSX.Element {
  const [wallet] = useWalletGlobalState(WALLET);
  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <h2>DeFi Loans</h2>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <ButtonGroup vertical={true} minimal={true}>
            <Button icon="database">Queries</Button>
            <Button icon="function">Functions</Button>
          </ButtonGroup>
        </div>
        <div className="column column-75">
          <p>.column</p>
          {wallet && wallet._publicKey ? <span>connected</span> : <span>disconnected</span>}
          <WalletConnection />
        </div>
      </div>
    </div>
  );
}
