import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { Alignment, Button, ButtonGroup, Navbar, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import {
  WALLET,
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
      <Link to={URL_LOANS} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon="timeline-line-chart" text="All Loans" />
      </Link>
      <Link to={URL_GUARANTEE} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon="timeline-line-chart" text="Provide Collateral" />
      </Link>
      <Link to={URL_ACCEPT} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon="timeline-line-chart" text="Lend" />
      </Link>
      {wallet && wallet._publicKey && (
        <Link to={URL_INVESTMENTS} style={{ textDecoration: 'none', display: 'block' }}>
          <MenuItem icon="timeline-line-chart" text="Investments" />
        </Link>
      )}
    </Menu>
  );

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
                {SOLANA_NETWORK_URL}
              </Button>
              <WalletConnection network={SOLANA_NETWORK_URL} />
            </Navbar.Group>
          </Navbar>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <ButtonGroup vertical={true} minimal={true}>
            <Popover2 content={borrowMenu} placement="right-end">
              <Button icon="import" text="Borrow" />
            </Popover2>
            <Popover2 content={lenderMenu} placement="right-end">
              <Button icon="timeline-line-chart" text="Lend" />
            </Popover2>
          </ButtonGroup>
        </div>
        <div className="column column-75">
          <div className="row">
            <Switch>
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
