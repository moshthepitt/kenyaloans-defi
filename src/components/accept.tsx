import React from 'react';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Spinner, Callout, Card, H3, Intent } from '@blueprintjs/core';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useQuery } from 'react-query';
import { acceptLoan } from '../utils/transaction';
import { getLoanAccounts, getTokenAccounts } from '../utils/api';
import { useGlobalState } from '../utils/state';
import { CONNECTION, WALLET, LOAN, TOKEN, NONE, URL_MY_LOANS } from '../constants';
import { CONNECT_TO_WALLET, REQUIRED } from '../lang';
import { PROGRAM_ID } from '../env';
import { LoanStatus, getStatusForUI } from './loans/helpers';
import { AppToaster } from './toast';

const Accept = (): JSX.Element => {
  const [wallet] = useGlobalState(WALLET);
  const [connection] = useGlobalState(CONNECTION);
  const { loanId } = useParams<{ loanId: string }>();
  const [ifDoneHere, setIfDoneHere] = React.useState<boolean>(false);

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
      tokenAcc.info.mint === loan.loanMintPubkey &&
      Number(tokenAcc.info.tokenAmount.amount) >= loan.expectedAmount
  );

  return (
    <div className="column">
      {ifDoneHere && <Redirect to={URL_MY_LOANS} />}
      <Card>
        <H3>Lend Money</H3>
        {loan.status === LoanStatus.Guaranteed && (
          <p>Please confirm that you want to accept lend for the loan with the details below.</p>
        )}
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
              <td>{loan.loanMintPubkey}</td>
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
            <tr>
              <th>Status</th>
              <td>{getStatusForUI(loan.status)}</td>
            </tr>
            {loan.status >= LoanStatus.Guaranteed && (
              <tr>
                <th>Guarantor</th>
                <td>{loan.guarantorPubkey}</td>
              </tr>
            )}
          </tbody>
        </table>
        {loan.status === LoanStatus.Guaranteed ? (
          <React.Fragment>
            <Callout intent={Intent.SUCCESS}>
              You stand to gain <strong>50%</strong> of the APR which is <strong>{gain}</strong>
              <br />
              This will be transferred to your account as tokens of the Token ID indicated above.
            </Callout>
            <br />
            <h3 className="bp3-heading">Accept Loan</h3>
            <Formik
              initialValues={{ lenderFundsAccount: NONE }}
              validate={(values) => {
                const errors: { amount?: string; lenderFundsAccount?: string } = {};
                if (!values.lenderFundsAccount || values.lenderFundsAccount == NONE) {
                  errors.lenderFundsAccount = REQUIRED;
                }
                return errors;
              }}
              onSubmit={async (values, { setSubmitting }) => {
                await acceptLoan({
                  connection,
                  borrowerReceiveAccount: loan.initializerReceiveLoanPubkey,
                  lenderFundsAccount: values.lenderFundsAccount,
                  loanAccount: loan.id,
                  loanProgramId: PROGRAM_ID ? PROGRAM_ID : '',
                  loanMintAccount: loan.loanMintPubkey,
                  wallet,
                });
                AppToaster.show({ message: 'Success!' });
                setSubmitting(false);
                setIfDoneHere(true);
              }}
            >
              {({ isSubmitting, errors }) => (
                <Form>
                  <label htmlFor="lenderFundsAccount">Loan Funds Account</label>
                  <p>
                    Select a token account to use as a source of funds for this loan. Only accounts
                    of the same token as the loan and with sufficient token balance are avilable
                    below.
                  </p>
                  <Field as="select" id="lenderFundsAccount" name="lenderFundsAccount">
                    <option value="none">--select--</option>
                    {availableAccounts &&
                      availableAccounts.length > 0 &&
                      availableAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.id} {'//'} {account.info.tokenAmount.uiAmount}
                        </option>
                      ))}
                  </Field>
                  <ErrorMessage name="lenderFundsAccount" component="p" />
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !wallet ||
                      !wallet._publicKey ||
                      Object.keys(errors).length > 0
                    }
                  >
                    Submit
                  </button>
                </Form>
              )}
            </Formik>
          </React.Fragment>
        ) : (
          <p>You cannot provide funds towards this loan.</p>
        )}
      </Card>
    </div>
  );
};

export { Accept };
