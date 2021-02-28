/* eslint-disable no-console, no-debugger, @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Alignment, Button, ButtonGroup, Navbar } from '@blueprintjs/core';
import {
  CONNECTION,
  WALLET,
  SINGLE_GOSSIP,
  LOCALNET,
  URL_ACCEPT,
  URL_APPLY,
  URL_GUARANTEE,
  URL_REPAY,
  URL_LOANS,
  URL_MY_LOANS,
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
  const [connection] = useGlobalState(CONNECTION);
  const match = useRouteMatch();

  // useEffect(() => {
  //   if (wallet && wallet._publicKey) {
  //     (async () => {
  //       const loanApp = await createAndInitializeTokenAccount(
  //         connection,
  //         wallet,
  //         new PublicKey('9SdM71wW3E1D1wMjwXXyemMXbDztSArqvrKgf5BB4bNT'),
  //         new Account(),
  //         13337
  //       );
  //       const loanGuarantee = await createAndInitializeTokenAccount(
  //         connection,
  //         wallet,
  //         new PublicKey('9SdM71wW3E1D1wMjwXXyemMXbDztSArqvrKgf5BB4bNT'),
  //         new Account(),
  //         2000000
  //       );
  //       const guarantorReceive = await createAndInitializeTokenAccount(
  //         connection,
  //         wallet,
  //         new PublicKey('9SdM71wW3E1D1wMjwXXyemMXbDztSArqvrKgf5BB4bNT'),
  //         new Account(),
  //         1000000000
  //       );
  //       const lender = await createAndInitializeTokenAccount(
  //         connection,
  //         wallet,
  //         new PublicKey('9SdM71wW3E1D1wMjwXXyemMXbDztSArqvrKgf5BB4bNT'),
  //         new Account(),
  //         44000000
  //       );
  //       const lenderReceive = await createAndInitializeTokenAccount(
  //         connection,
  //         wallet,
  //         new PublicKey('9SdM71wW3E1D1wMjwXXyemMXbDztSArqvrKgf5BB4bNT'),
  //         new Account(),
  //         1000000000
  //       );
  //       const borrowerRepay = await createAndInitializeTokenAccount(
  //         connection,
  //         wallet,
  //         new PublicKey('9SdM71wW3E1D1wMjwXXyemMXbDztSArqvrKgf5BB4bNT'),
  //         new Account(),
  //         7000000
  //       );
  // const loanInit = await initLoan({
  //   connection,
  //   expectedAmount: 50000,
  //   loanApplicationAccount: '5J18mj39vYtRhN5LTj91LT4MTeAXXq4sTzUXNQEYrwaW',
  //   loanReceiveAccount: 'BFzJ7cQNvJEm4Vcsp1KWzfczE3zPjC2yTbv8ZJQwKdbE',
  //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //   wallet,
  // });
  // const loanGTx = await guaranteeLoan({
  //   connection,
  //   guarantorTokenAccount: 'CriwWBrvq6Y4X8NyrsGowMux1fdm4eZ4Y2oYf5ULtbmc',
  //   loanAccount: 'EncEi9WYFi1ekpkEPncVPfkzSdejpijiVnivefB9ncHu',
  //   loanCollateralAccount: '7vcCZup2SxosgeHNEH8j5haByNNewVW9fX9Xknh4cZpi',
  //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //   wallet,
  // });
  // const acceptLIx = await acceptLoan({
  //   connection,
  //   borrowerReceiveAccount: 'BFzJ7cQNvJEm4Vcsp1KWzfczE3zPjC2yTbv8ZJQwKdbE',
  //   lenderFundsAccount: 'Bv9irALCT1UXUdY1oALSM9bhJo6yjddpLJRRUyWkUq9y',
  //   lenderRepaymentAccount: 'Fi7CuYbdsHwY9g8bDfFa76dFqYxRuhmrnDpxuPnZPwEf',
  //   loanAccount: 'EncEi9WYFi1ekpkEPncVPfkzSdejpijiVnivefB9ncHu',
  //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //   wallet,
  // });
  // const repayIx = await repayLoan({
  //   collateralTokenAccount: '7vcCZup2SxosgeHNEH8j5haByNNewVW9fX9Xknh4cZpi',
  //   connection,
  //   guarantorAccount: wallet.publicKey.toBase58(),
  //   guarantorTokenAccount: 'CriwWBrvq6Y4X8NyrsGowMux1fdm4eZ4Y2oYf5ULtbmc',
  //   lenderAccount: wallet.publicKey.toBase58(),
  //   lenderTokenAccount: 'Fi7CuYbdsHwY9g8bDfFa76dFqYxRuhmrnDpxuPnZPwEf',
  //   loanAccount: 'EncEi9WYFi1ekpkEPncVPfkzSdejpijiVnivefB9ncHu',
  //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  //   payerTokenAccount: '4traM9QkqJBiaS1g6nyjHNuwVW4G5j9G6Qeix9afyeQZ',
  //   wallet,
  // });
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // const accounts = await getLoanAccounts({
  //   connection,
  //   loanProgramId: '7TfVHJ5koeLu98c6q8sUuoinP52VUeUJNcG8UAkTHdhD',
  // });
  // debugger;
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
            {PROGRAM_ID && wallet && wallet._publicKey && (
              <Link to={URL_MY_LOANS} className="bp3-button">
                <span className="bp3-button-text">My Loans</span>
              </Link>
            )}
            {PROGRAM_ID && (
              <Link to={URL_LOANS} className="bp3-button">
                <span className="bp3-button-text">Loans</span>
              </Link>
            )}
            <Link to={URL_APPLY} className="bp3-button">
              <span className="bp3-button-text">Apply</span>
            </Link>
            <Link
              to={`${URL_GUARANTEE}/6GRcin3zDX1oTaL6srncjZyyk1yWEXMxWMinKqmvTx5v`}
              className="bp3-button"
            >
              <span className="bp3-button-text">Guarantee</span>
            </Link>
            <Link
              to={`${URL_ACCEPT}/82PBjGQtpYFmPSQon8USVtWy7E1wNJAtyfnbZaTbgVra`}
              className="bp3-button"
            >
              <span className="bp3-button-text">Accept</span>
            </Link>
            <Link
              to={`${URL_REPAY}/82PBjGQtpYFmPSQon8USVtWy7E1wNJAtyfnbZaTbgVra`}
              className="bp3-button"
            >
              <span className="bp3-button-text">Repay</span>
            </Link>
          </ButtonGroup>
        </div>
        <div className="column column-75">
          <div className="row">
            <Switch>
              <Route path={`${URL_ACCEPT}/:loanId`}>
                <Accept />
              </Route>
              <Route path={URL_APPLY}>
                <Apply />
              </Route>
              <Route path={`${URL_GUARANTEE}/:loanId`}>
                <Guarantee />
              </Route>
              <Route path={`${URL_REPAY}/:loanId`}>
                <Repay />
              </Route>
              {PROGRAM_ID && (
                <Route path={URL_LOANS}>
                  <Loans loanProgramId={PROGRAM_ID} />
                </Route>
              )}
              {PROGRAM_ID && wallet && wallet._publicKey && (
                <Route path={URL_MY_LOANS}>
                  <Loans initializer={wallet.publicKey.toBase58()} loanProgramId={PROGRAM_ID} />
                </Route>
              )}
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}
