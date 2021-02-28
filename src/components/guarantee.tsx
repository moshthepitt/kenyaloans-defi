import React from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Callout, Card, H3, Intent } from '@blueprintjs/core';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useQuery } from 'react-query';
import { getLoanAccounts, getTokenAccounts } from '../utils/api';
import { useGlobalState } from '../utils/state';
import { CONNECTION, WALLET, LOAN, TOKEN, NONE } from '../constants';
import { CONNECT_TO_WALLET, REQUIRED } from '../lang';
import { PROGRAM_ID } from '../env';

const Guarantee = (): JSX.Element => {
  const [wallet] = useGlobalState(WALLET);
  const [connection] = useGlobalState(CONNECTION);
  const { loanId } = useParams<{ loanId: string }>();

  const loanQuery = async () => getLoanAccounts({ loanProgramId: PROGRAM_ID || '', connection });
  const loans = useQuery(LOAN, loanQuery);
  const tokenQuery =
    wallet && wallet._publicKey
      ? async () => getTokenAccounts({ accountPublicKey: wallet.publicKey, connection })
      : async () => [];
  const userTokens = useQuery(TOKEN, tokenQuery);

  if (!PROGRAM_ID) {
    return <span>Invalid Program ID</span>;
  }

  if (!wallet || !wallet._publicKey) {
    return <span>{CONNECT_TO_WALLET}</span>;
  }

  if (loans.isLoading || userTokens.isLoading) {
    return <Spinner />;
  }

  if (loans.error || userTokens.error) {
    return <span>Error...</span>;
  }

  const filteredLoans = loans.data?.filter((item) => item.id === loanId);

  if (!filteredLoans || filteredLoans.length < 1) {
    return <p>Not found</p>;
  }

  const loan = filteredLoans[0];
  const gain = loan.expectedAmount * (loan.interestRate / 100);

  const availableAccounts = userTokens.data?.filter(
    (tokenAcc) =>
      tokenAcc.info.mint === loan.applicationFeeAccountPubkey &&
      Number(tokenAcc.info.tokenAmount.amount) >= loan.expectedAmount
  );

  return (
    <div className="column">
      <Card>
        <H3>Guarantee Loan</H3>
        <p>Please confirm that you want to provide the collateral for the this loan.</p>
        <table>
          <tbody>
            <tr>
              <th>ID</th>
              <td>{loan.id}</td>
            </tr>
            <tr>
              <th>Initializer</th>
              <td>{loan.initializerPubkey}</td>
            </tr>
            <tr>
              <th>Token ID</th>
              <td>{loan.applicationFeeAccountPubkey}</td>
            </tr>
            <tr>
              <th>Amount</th>
              <td>{loan.expectedAmount}</td>
            </tr>
            <tr>
              <th>Duration</th>
              <td>{loan.duration} hours</td>
            </tr>
            <tr>
              <th>APR</th>
              <td>{loan.interestRate}%</td>
            </tr>
          </tbody>
        </table>
        <Callout intent={Intent.SUCCESS}>
          You stand to gain <strong>5%</strong> of the APR which is <strong>{gain}</strong>
          <br />
          This will be transferred to your account as tokens of the Token ID indicated above.
        </Callout>
        <br />
        <h3 className="bp3-heading">Guarantee Loan</h3>
        <Formik
          initialValues={{ collateralAccount: NONE }}
          validate={(values) => {
            const errors: { amount?: string; collateralAccount?: string } = {};
            if (!values.collateralAccount || values.collateralAccount == NONE) {
              errors.collateralAccount = REQUIRED;
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              <label htmlFor="collateralAccount">Collateral Account</label>
              <p>
                Select a token account to use as collateral for this loan. Only accounts of the same
                token as the loan and with sufficient token balance are avilable below.
              </p>
              <Field as="select" id="collateralAccount" name="collateralAccount">
                <option value="none">--select--</option>
                {availableAccounts &&
                  availableAccounts.length > 0 &&
                  availableAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.id} {'//'} {account.info.tokenAmount.uiAmount}
                    </option>
                  ))}
              </Field>
              <ErrorMessage name="collateralAccount" component="p" />
              <button
                type="submit"
                disabled={
                  isSubmitting || !wallet || !wallet._publicKey || Object.keys(errors).length > 0
                }
              >
                Submit
              </button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export { Guarantee };
