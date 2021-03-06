import React from 'react';
import { Link } from 'react-router-dom';
import { Callout, Classes, Button, H3, H4, H5, Tab, Tabs } from '@blueprintjs/core';
import { WalletConnection } from './Wallet';
import { useGlobalState } from '../utils/state';
import { WALLET, URL_FAUCET } from '../constants';

const BorrowerPanel = () => (
  <div>
    <H4>How to Borrow Money</H4>
    <p className={Classes.RUNNING_TEXT}>
      Applying for loans is simple and can be done in three easy steps:
    </p>
    <ol>
      <li>Click on &quot;Apply&quot; under the &quot;Borrow menu&quot; item </li>
      <li>Fill in the loan application form (and pay the loan application fee) </li>
      <li>Once we match you with a lender, funds will be sent directly to your account.</li>
    </ol>
  </div>
);

const GuarantorPanel = () => (
  <div>
    <H4>How To Provide Collateral For Profit</H4>
    <p className={Classes.RUNNING_TEXT}>
      A Guarantor provides collateral for a given loan request and receives a significant portion of
      the interest charged on the loan as payment.
    </p>
    <ol>
      <li>Click on &quot;Provide Collateral&quot; under the &quot;Lend menu&quot; item </li>
      <li>Select one of the available loans </li>
      <li>Fill in the Guarantee Loan form</li>
    </ol>
  </div>
);

const LenderPanel = () => (
  <div>
    <H4>How To Provide Debt Finance For Profit</H4>
    <p className={Classes.RUNNING_TEXT}>
      As a lender, you have a great opportunity to earn a relatively-risk-free return on investment
      by lending money for fully collaterized loans.
    </p>
    <ol>
      <li>Click on &quot;Lend&quot; under the &quot;Lend menu&quot; item </li>
      <li>Select one of the available loans </li>
      <li>Fill in the Lend Loan form</li>
    </ol>
  </div>
);

export const Home = (): JSX.Element => {
  const [wallet] = useGlobalState(WALLET);
  return (
    <div className="column">
      <H3>Welcome to Kenya Loans</H3>
      <p>
        Searching for a good loan in today&apos;s economic conditions is difficult. KenyaLoans
        matches borrowers with accessible and affordable loans.
      </p>
      <p>
        Our mission is to ensure equitable access to financing to absolutely everyone in the world.
      </p>
      <H3>How Does It Work</H3>
      <Tabs id="tabs">
        <Tab id="Borrower" title="Borrower" panel={<BorrowerPanel />} />
        <Tab id="Guarantor" title="Guarantor" panel={<GuarantorPanel />} />
        <Tab id="Lender" title="Lender" panel={<LenderPanel />} />
      </Tabs>
      {!wallet || !wallet._publicKey ? (
        <React.Fragment>
          <H5>Connect your wallet to begin</H5>
          <WalletConnection />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <H5>Get Test Token Accounts</H5>
          <p>This will ensure you can more easily test the system.</p>
          <Link to={URL_FAUCET}>
            <Button type="button" icon="wrench" intent="success" minimal={true} small={true}>
              Generate Test Accounts
            </Button>
          </Link>
        </React.Fragment>
      )}
      <Callout intent="warning">
        Kenya Loans is only available on the devnet Solana network as it is still in development.
      </Callout>
      <hr />
    </div>
  );
};
