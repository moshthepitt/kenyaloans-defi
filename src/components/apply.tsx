import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useGlobalState } from '../utils/state';
import { WALLET } from '../constants';

const Apply = (): JSX.Element => {
  const [wallet] = useGlobalState(WALLET);

  return (
    <div>
      <h3 className="bp3-heading">Apply For Loan</h3>
      <Formik
        initialValues={{ amount: 100, currency: 'new' }}
        validate={(values) => {
          const errors: { amount?: string; currency?: string } = {};
          if (!values.amount) {
            errors.amount = 'Required';
          } else if (values.amount < 100) {
            errors.amount = 'Invalid amount';
          }
          if (!values.currency) {
            errors.currency = 'Required';
          } else if (values.currency != 'new') {
            errors.currency = 'Currency not yet supported :(';
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
            <label htmlFor="currency">Currency</label>
            <Field as="select" id="currency" name="currency">
              <option value="new">New Token (for testing)</option>
              <option value="SOL">SOL</option>
              <option value="USDC">USDC</option>
              <option value="BTC">BTC</option>
            </Field>
            <ErrorMessage name="currency" component="p" />
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
