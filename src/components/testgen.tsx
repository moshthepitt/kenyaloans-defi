import React from 'react';
import {
  Account,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import { Redirect } from 'react-router-dom';
import { Button, H3, Callout, H4 } from '@blueprintjs/core';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import { AccountLayout } from '@solana/spl-token';
import type { WalletType } from '../utils/state';
import type { Result } from '../utils/types';
import { failure } from '../utils/types';
import { signAndSendTransaction } from '../utils/transaction';
import { TOKEN_PROGRAM_ID, initializeAccount, mintTo } from '../utils/token';
import { useGlobalState } from '../utils/state';
import { CONNECTION, WALLET, URL_APPLY } from '../constants';
import { CONNECT_TO_WALLET } from '../lang';
import { AppToaster } from './toast';

interface CreateMintParams {
  connection: Connection;
  wallet: WalletType /**Wallet for paying fees and allowed to mint new tokens*/;
  mint: PublicKey /** Account to hold token information*/;
  initialAccounts: Array<{
    account: Account;
    amount: number;
  }>;
}

export const createMintAccounts = async (
  params: CreateMintParams
): Promise<Result<TransactionSignature>> => {
  const { connection, wallet, mint, initialAccounts } = params;
  const transaction = new Transaction();

  let minAmount: number;
  try {
    minAmount = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  } catch (error) {
    return failure(error);
  }

  const signers: Account[] = [];

  initialAccounts.forEach((item) => {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: item.account.publicKey,
        lamports: minAmount,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    signers.push(item.account);
    transaction.add(
      initializeAccount({
        account: item.account.publicKey,
        mint,
        owner: wallet.publicKey,
      })
    );
    transaction.add(
      mintTo({
        mint: mint,
        destination: item.account.publicKey,
        amount: item.amount,
        mintAuthority: wallet.publicKey,
      })
    );
  });

  return await signAndSendTransaction(connection, transaction, wallet, signers);
};

export const TestGen = (): JSX.Element => {
  const [wallet] = useGlobalState(WALLET);
  const [connection] = useGlobalState(CONNECTION);
  const [ifDoneHere, setIfDoneHere] = React.useState<boolean>(false);

  const initialValues = {
    mint: '',
    accounts: [
      {
        amount: 133337,
      },
      {
        amount: 133337,
      },
      {
        amount: 133337,
      },
      {
        amount: 133337,
      },
      {
        amount: 133337,
      },
    ],
  };

  if (!wallet || !wallet._publicKey) {
    return (
      <div className="column">
        <span>{CONNECT_TO_WALLET}</span>
      </div>
    );
  }

  return (
    <div className="column">
      {ifDoneHere && <Redirect to={URL_APPLY} />}
      <H3>Generate Test Accounts</H3>
      <Callout intent="none">
        You can create a new mint accounts using the form below.
        <br />
        Use these for testing the lending functionality.
      </Callout>
      <hr />
      <H4>Create a new token accounts and with these balances:</H4>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          const result = await createMintAccounts({
            connection,
            initialAccounts: values.accounts.map((item) => {
              return { account: new Account(), amount: item.amount };
            }),
            mint: new PublicKey(values.mint),
            wallet,
          });
          setSubmitting(false);
          if (result.error) {
            AppToaster.show({ message: `Error: ${result.error.message}` });
          } else {
            AppToaster.show({
              message: 'Success! Please wait up to 30 seconds for changes to take place.',
            });
            setIfDoneHere(true);
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <label htmlFor="mint">Mint Address</label>
            <Field id="mint" type="text" name="mint" />
            <p>
              To get the mint address, you can mint a test token from sollet.io. Paste the Token
              Address above.
            </p>
            <FieldArray name="accounts">
              {({ remove, push }) => (
                <div>
                  {values.accounts.length > 0 &&
                    values.accounts.map((account, index) => (
                      <div className="row" key={index}>
                        <div className="column">
                          <label htmlFor={`accounts.${index}.amount`}>Account {index + 1}</label>
                          <Field
                            name={`accounts.${index}.amount`}
                            placeholder="The amount goes here"
                            type="number"
                          />
                          <ErrorMessage
                            name={`accounts.${index}.amount`}
                            component="div"
                            className="field-error"
                          />
                        </div>
                        <div className="column">
                          <Button
                            type="button"
                            small={true}
                            intent="danger"
                            minimal={true}
                            className="secondary"
                            onClick={() => remove(index)}
                          >
                            X
                          </Button>
                        </div>
                      </div>
                    ))}
                  <Button
                    type="button"
                    className="secondary"
                    small={true}
                    intent="primary"
                    onClick={() => push({ amount: 133337 })}
                  >
                    Add Account
                  </Button>
                </div>
              )}
            </FieldArray>
            <hr />
            <Button disabled={isSubmitting} type="submit" intent="success" large={true}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
