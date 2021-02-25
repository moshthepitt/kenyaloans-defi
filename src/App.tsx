/* eslint-disable no-console, no-debugger, @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { Alignment, Button, ButtonGroup, Navbar } from '@blueprintjs/core';
import {
  WALLET,
  SINGLE_GOSSIP,
  LOCALNET,
  URL_ACCEPT,
  URL_APPLY,
  URL_GUARANTEE,
  URL_REPAY,
  URL_LOANS,
} from './constants';
import { PROGRAM_ID, SOLANA_NETWORK_URL } from './env';
import {
  Account,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LOAN_ACCOUNT_DATA_LAYOUT, LoanLayout, LoanData } from './utils/layout';
import {
  createAndInitializeTokenAccount,
  acceptLoan,
  guaranteeLoan,
  initLoan,
  repayLoan,
} from './utils/transaction';
import { unpackLoan } from './utils/transform';
import { getLoanAccounts } from './utils/api';
import BN from 'bn.js';
import { initializeAccount } from './utils/token';
import { useGlobalState } from './utils/state';
import { Accept, Apply, Guarantee, Loans, Repay, WalletConnection } from './components';

import '@blueprintjs/core/lib/css/blueprint.css';
import 'milligram/dist/milligram.css';

/**
 * Main app
 */
export default function App(): JSX.Element {
  const [wallet] = useGlobalState(WALLET);

  const connection = new Connection(SOLANA_NETWORK_URL, SINGLE_GOSSIP);

  // useEffect(() => {
  //   if (wallet && wallet._publicKey) {
  //     (async () => {
  //       // const loanApp = await createAndInitializeTokenAccount(
  //       //   connection,
  //       //   wallet,
  //       //   new PublicKey('3r9YHjG8FzvdjDbJePxVdBwrJynCQX1sASmBrvst5jAd'),
  //       //   new Account(),
  //       //   13337
  //       // );
  //       // const loanGuarantee = await createAndInitializeTokenAccount(
  //       //   connection,
  //       //   wallet,
  //       //   new PublicKey('3r9YHjG8FzvdjDbJePxVdBwrJynCQX1sASmBrvst5jAd'),
  //       //   new Account(),
  //       //   2000000
  //       // );
  //       // const guarantorReceive = await createAndInitializeTokenAccount(
  //       //   connection,
  //       //   wallet,
  //       //   new PublicKey('3r9YHjG8FzvdjDbJePxVdBwrJynCQX1sASmBrvst5jAd'),
  //       //   new Account(),
  //       //   1000000000
  //       // );
  //       // const lender = await createAndInitializeTokenAccount(
  //       //   connection,
  //       //   wallet,
  //       //   new PublicKey('3r9YHjG8FzvdjDbJePxVdBwrJynCQX1sASmBrvst5jAd'),
  //       //   new Account(),
  //       //   44000000
  //       // );
  //       // const lenderReceive = await createAndInitializeTokenAccount(
  //       //   connection,
  //       //   wallet,
  //       //   new PublicKey('3r9YHjG8FzvdjDbJePxVdBwrJynCQX1sASmBrvst5jAd'),
  //       //   new Account(),
  //       //   1000000000
  //       // );
  //       // const borrowerRepay = await createAndInitializeTokenAccount(
  //       //   connection,
  //       //   wallet,
  //       //   new PublicKey('3r9YHjG8FzvdjDbJePxVdBwrJynCQX1sASmBrvst5jAd'),
  //       //   new Account(),
  //       //   7000000
  //       // );
  //       // const loanInit = await initLoan({
  //       //   connection,
  //       //   expectedAmount: 50000,
  //       //   loanApplicationAccount: '5J18mj39vYtRhN5LTj91LT4MTeAXXq4sTzUXNQEYrwaW',
  //       //   loanReceiveAccount: 'BFzJ7cQNvJEm4Vcsp1KWzfczE3zPjC2yTbv8ZJQwKdbE',
  //       //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //       //   wallet,
  //       // });
  //       // const loanGTx = await guaranteeLoan({
  //       //   connection,
  //       //   guarantorTokenAccount: 'CriwWBrvq6Y4X8NyrsGowMux1fdm4eZ4Y2oYf5ULtbmc',
  //       //   loanAccount: 'EncEi9WYFi1ekpkEPncVPfkzSdejpijiVnivefB9ncHu',
  //       //   loanCollateralAccount: '7vcCZup2SxosgeHNEH8j5haByNNewVW9fX9Xknh4cZpi',
  //       //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //       //   wallet,
  //       // });
  //       // const acceptLIx = await acceptLoan({
  //       //   connection,
  //       //   borrowerReceiveAccount: 'BFzJ7cQNvJEm4Vcsp1KWzfczE3zPjC2yTbv8ZJQwKdbE',
  //       //   lenderFundsAccount: 'Bv9irALCT1UXUdY1oALSM9bhJo6yjddpLJRRUyWkUq9y',
  //       //   lenderRepaymentAccount: 'Fi7CuYbdsHwY9g8bDfFa76dFqYxRuhmrnDpxuPnZPwEf',
  //       //   loanAccount: 'EncEi9WYFi1ekpkEPncVPfkzSdejpijiVnivefB9ncHu',
  //       //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //       //   wallet,
  //       // });
  //       // const repayIx = await repayLoan({
  //       //   collateralTokenAccount: '7vcCZup2SxosgeHNEH8j5haByNNewVW9fX9Xknh4cZpi',
  //       //   connection,
  //       //   guarantorAccount: wallet.publicKey.toBase58(),
  //       //   guarantorTokenAccount: 'CriwWBrvq6Y4X8NyrsGowMux1fdm4eZ4Y2oYf5ULtbmc',
  //       //   lenderAccount: wallet.publicKey.toBase58(),
  //       //   lenderTokenAccount: 'Fi7CuYbdsHwY9g8bDfFa76dFqYxRuhmrnDpxuPnZPwEf',
  //       //   loanAccount: 'EncEi9WYFi1ekpkEPncVPfkzSdejpijiVnivefB9ncHu',
  //       //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //       //   payerTokenAccount: '4traM9QkqJBiaS1g6nyjHNuwVW4G5j9G6Qeix9afyeQZ',
  //       //   wallet,
  //       // });
  //       // await new Promise((resolve) => setTimeout(resolve, 1000));
  //       const accounts = await getLoanAccounts({
  //         connection,
  //         loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //       });
  //       debugger;
  //     })().catch((e) => null);
  //   }
  // }, [wallet]);

  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <Navbar style={{ marginBottom: '2rem' }}>
            <Navbar.Group align={Alignment.LEFT}>
              <Navbar.Heading>DeFi Loans</Navbar.Heading>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
              <Button minimal={true} small={true}>
                {LOCALNET}
              </Button>
              <WalletConnection network={LOCALNET} />
            </Navbar.Group>
          </Navbar>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <ButtonGroup vertical={true} minimal={true}>
            <Link to={URL_LOANS} className="bp3-button">
              <span className="bp3-button-text">Loans</span>
            </Link>
            <Link to={URL_APPLY} className="bp3-button">
              <span className="bp3-button-text">Apply</span>
            </Link>
            <Link to={URL_GUARANTEE} className="bp3-button">
              <span className="bp3-button-text">Guarantee</span>
            </Link>
            <Link to={URL_ACCEPT} className="bp3-button">
              <span className="bp3-button-text">Accept</span>
            </Link>
            <Link to={URL_REPAY} className="bp3-button">
              <span className="bp3-button-text">Repay</span>
            </Link>
          </ButtonGroup>
        </div>
        <div className="column column-75">
          <div className="row">
            <Switch>
              <Route path={URL_ACCEPT}>
                <Accept />
              </Route>
              <Route path={URL_APPLY}>
                <Apply />
              </Route>
              <Route path={URL_GUARANTEE}>
                <Guarantee />
              </Route>
              <Route path={URL_REPAY}>
                <Repay />
              </Route>
              <Route path={URL_LOANS}>
                <Loans
                  connection={connection}
                  loanProgramId="7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD"
                />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}
