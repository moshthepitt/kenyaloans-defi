import React from 'react';
import { Spinner } from '@blueprintjs/core';
import { useQuery } from 'react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { getTokenAccounts } from '../utils/api';
import { useGlobalState } from '../utils/state';
import { CONNECTION, WALLET, TOKEN } from '../constants';

const Apply = (): JSX.Element => {
  const [wallet] = useGlobalState(WALLET);
  const [connection] = useGlobalState(CONNECTION);

  const loanQuery =
    wallet && wallet._publicKey
      ? async () => getTokenAccounts({ accountPublicKey: wallet.publicKey, connection })
      : async () => [];
  const { isLoading, error, data } = useQuery(TOKEN, loanQuery);

  if (!wallet || !wallet._publicKey) {
    return <span>Please connect to wallet.</span>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <span>Error...</span>;
  }

  return (
    <div>
      <h3 className="bp3-heading">Apply For Loan</h3>
      <Formik
        initialValues={{ amount: 100, tokenAccount: 'none' }}
        validate={(values) => {
          const errors: { amount?: string; tokenAccount?: string } = {};
          if (!values.amount) {
            errors.amount = 'Required';
          } else if (values.amount < 100) {
            errors.amount = 'Invalid amount';
          }
          if (!values.tokenAccount || values.tokenAccount == 'none') {
            errors.tokenAccount = 'Required';
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
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
                  <option key={account.id} value={account.id}>
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
            {(!wallet || !wallet._publicKey) && <p>Please connect your wallet</p>}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { Apply };
