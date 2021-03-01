import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { Alignment, Button, Navbar, Menu, MenuItem, H2 } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import {
  WALLET,
  URL_HOME,
  URL_INVESTMENTS,
  URL_ACCEPT,
  URL_APPLY,
  URL_GUARANTEE,
  URL_REPAY,
  URL_LOANS,
  URL_MY_LOANS,
  URL_FAUCET,
} from './constants';
import { PROGRAM_ID, SOLANA_NETWORK_URL } from './env';
import { useGlobalState } from './utils/state';
import {
  Accept,
  AcceptLoans,
  Apply,
  Guarantee,
  GuaranteeLoans,
  Home,
  Investments,
  Loans,
  MyLoans,
  Repay,
  WalletConnection,
} from './components';
import { TestGen } from './components/testgen';
import { LoanStatus } from './components/loans/helpers';

import '@blueprintjs/core/lib/css/blueprint.css';
import 'milligram/dist/milligram.css';

/**
 * Main app
 */
export default function App(): JSX.Element {
  const [wallet] = useGlobalState(WALLET);

  const borrowMenu = (
    <Menu>
      <Link to={URL_APPLY} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon="import" text="Apply" />
      </Link>
      {PROGRAM_ID && wallet && wallet._publicKey && (
        <Link to={URL_MY_LOANS} style={{ textDecoration: 'none', display: 'block' }}>
          <MenuItem icon="stacked-chart" text="My Loans" />
        </Link>
      )}
    </Menu>
  );

  const lenderMenu = (
    <Menu>
      <Link to={URL_GUARANTEE} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon="export" text="Provide Collateral" />
      </Link>
      <Link to={URL_ACCEPT} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon="endorsed" text="Lend" />
      </Link>
      {wallet && wallet._publicKey && (
        <Link to={URL_INVESTMENTS} style={{ textDecoration: 'none', display: 'block' }}>
          <MenuItem icon="timeline-line-chart" text="My Investments" />
        </Link>
      )}
      <Link to={URL_LOANS} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon="database" text="All Loans" />
      </Link>
    </Menu>
  );

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <div className="row">
        <div className="column">
          <Navbar style={{ marginBottom: '2rem' }}>
            <Navbar.Group align={Alignment.LEFT}>
              <Navbar.Heading>
                <H2>
                  <Link to={URL_HOME} style={{ textDecoration: 'none' }}>
                    Kenya Loans
                  </Link>
                </H2>
              </Navbar.Heading>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
              <Popover2 content={borrowMenu} placement="auto">
                <Button icon="import" text="Borrow" minimal={true} small={true} />
              </Popover2>
              <Popover2 content={lenderMenu} placement="auto">
                <Button icon="timeline-line-chart" text="Lend" minimal={true} small={true} />
              </Popover2>
              <span className="bp3-navbar-divider"></span>
              <WalletConnection network={SOLANA_NETWORK_URL} />
            </Navbar.Group>
          </Navbar>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <div className="row">
            <Switch>
              <Route path={URL_HOME} exact={true}>
                <Home />
              </Route>
              <Route path={URL_FAUCET}>
                <TestGen />
              </Route>
              <Route path={URL_APPLY}>
                <Apply />
              </Route>
              {PROGRAM_ID && wallet && wallet._publicKey && (
                <Route path={URL_MY_LOANS}>
                  <Loans
                    Component={MyLoans}
                    filters={{ initializer: wallet.publicKey.toBase58() }}
                    loanProgramId={PROGRAM_ID}
                  />
                </Route>
              )}
              <Route path={`${URL_ACCEPT}/:loanId`}>
                <Accept />
              </Route>
              <Route path={`${URL_GUARANTEE}/:loanId`}>
                <Guarantee />
              </Route>
              <Route path={`${URL_REPAY}/:loanId`}>
                <Repay />
              </Route>
              {PROGRAM_ID && (
                <React.Fragment>
                  <Route path={URL_LOANS}>
                    <Loans
                      filters={{ excludeStatus: [LoanStatus.Repaid] }}
                      loanProgramId={PROGRAM_ID}
                    />
                  </Route>
                  <Route path={URL_GUARANTEE}>
                    <Loans
                      Component={GuaranteeLoans}
                      filters={{ status: [LoanStatus.Initialized] }}
                      loanProgramId={PROGRAM_ID}
                    />
                  </Route>
                  <Route path={URL_ACCEPT}>
                    <Loans
                      Component={AcceptLoans}
                      filters={{ status: [LoanStatus.Guaranteed] }}
                      loanProgramId={PROGRAM_ID}
                    />
                  </Route>
                  {wallet && wallet._publicKey && (
                    <Route path={URL_INVESTMENTS}>
                      <Loans
                        Component={Investments}
                        filters={{
                          investor: wallet.publicKey.toBase58(),
                        }}
                        loanProgramId={PROGRAM_ID}
                      />
                    </Route>
                  )}
                </React.Fragment>
              )}
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}
