import React from 'react';
import { Redirect } from 'react-router-dom';
import { Spinner } from '@blueprintjs/core';
import { useQuery } from 'react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { initLoan } from '../utils/transaction';
import { getTokenAccounts } from '../utils/api';
import { useGlobalState } from '../utils/state';
import { CONNECTION, WALLET, TOKEN, NONE, URL_MY_LOANS } from '../constants';
import { PROGRAM_ID } from '../env';
import { REQUIRED, INVALID_AMOUNT, CONNECT_TO_WALLET } from '../lang';
import { AppToaster } from './toast';

const Apply = (): JSX.Element => {
  const [wallet] = useGlobalState(WALLET);
  const [connection] = useGlobalState(CONNECTION);
  const [ifDoneHere, setIfDoneHere] = React.useState<boolean>(false);

  const tokenQuery =
    wallet && wallet._publicKey
      ? async () => getTokenAccounts({ accountPublicKey: wallet.publicKey, connection })
      : async () => [];
  const { isLoading, error, data } = useQuery(TOKEN, tokenQuery);

  if (!PROGRAM_ID) {
    return <span>Invalid Program ID</span>;
  }

  if (!wallet || !wallet._publicKey) {
    return <span>{CONNECT_TO_WALLET}</span>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <span>Error...</span>;
  }

  return (
    <div>
      {ifDoneHere && <Redirect to={URL_MY_LOANS} />}
      <h3 className="bp3-heading">Apply For Loan</h3>
      <Formik
        initialValues={{ amount: 100, tokenAccount: NONE }}
        validate={(values) => {
          const errors: { amount?: string; tokenAccount?: string } = {};
          if (!values.amount) {
            errors.amount = REQUIRED;
          } else if (values.amount < 100) {
            errors.amount = INVALID_AMOUNT;
          }
          if (!values.tokenAccount || values.tokenAccount == NONE) {
            errors.tokenAccount = REQUIRED;
          }
          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          await initLoan({
            connection,
            expectedAmount: values.amount,
            loanProgramId: PROGRAM_ID ? PROGRAM_ID : '',
            loanMintAccount: values.tokenAccount,
            wallet,
          });
          AppToaster.show({ message: 'Success!' });
          setSubmitting(false);
          setIfDoneHere(true);
        }}
      >
        {({ isSubmitting, errors }) => (
          <Form>
            <label htmlFor="email">Amount</label>
            <Field id="amount" type="number" name="amount" />
            <ErrorMessage name="amount" component="p" />
            <label htmlFor="tokenAccount">Currency</label>
            <Field as="select" id="tokenAccount" name="tokenAccount">
              <option value="none">--select--</option>
              {data &&
                data.length > 0 &&
                data.map((account) => (
                  <option key={account.id} value={account.info.mint}>
                    {account.id} {'//'} {account.info.tokenAmount.uiAmount}
                  </option>
                ))}
            </Field>
            <ErrorMessage name="tokenAccount" component="p" />
            <button
              type="submit"
              disabled={
                isSubmitting || !wallet || !wallet._publicKey || Object.keys(errors).length > 0
              }
            >
              Submit
            </button>
            {(!wallet || !wallet._publicKey) && <p>{CONNECT_TO_WALLET}</p>}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { Apply };
