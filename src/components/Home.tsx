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
      <li>Fill in the loan application form </li>
      <li>Once we match you with a lender, funds will be sent directly to your account.</li>
    </ol>
  </div>
);

const GuarantorPanel = () => (
  <div>
    <H4>How To Provide Collateral For Profit</H4>
    <p className={Classes.RUNNING_TEXT}>
      Lots of people use React as the V in MVC. Since React makes no assumptions about the rest of
      your technology stack, it&apos;s easy to try it out on a small feature in an existing project.
    </p>
  </div>
);

const LenderPanel = () => (
  <div>
    <H4>How To Provide Debt Finance For Profit</H4>
    <p className={Classes.RUNNING_TEXT}>
      Lots of people use React as the V in MVC. Since React makes no assumptions about the rest of
      your technology stack, it&apos;s easy to try it out on a small feature in an existing project.
    </p>
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
      <hr />
      <Callout intent="warning">
        Kenya Loans is only available on the devnet Solana network as it is still in development.
      </Callout>
    </div>
  );
};
