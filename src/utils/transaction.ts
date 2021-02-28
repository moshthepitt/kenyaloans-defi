import {
  Account,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';
import BN from 'bn.js';
import type { WalletType } from './state';
import { APPLICATION_FEE, LE, LOAN, MAX, SINGLE, SINGLE_GOSSIP } from '../constants';
import { success, failure } from './types';
import type { Result } from './types';
import { LOAN_ACCOUNT_DATA_LAYOUT } from './layout';
import { initializeAccount, mintTo, TOKEN_PROGRAM_ID } from './token';

/**
 * @param connection - the connection to the blockchain
 * @param transaction - the transaction to sign and send
 * @param wallet - the wallet (represents the person doing the transaction)
 * @param signers - the accounts to sign the transaction (optional)
 */
export async function signAndSendTransaction(
  connection: Connection,
  transaction: Transaction,
  wallet: WalletType,
  signers: Array<Account> = []
): Promise<Result<TransactionSignature>> {
  try {
    transaction.recentBlockhash = (await connection.getRecentBlockhash(MAX)).blockhash;
  } catch (error) {
    return failure(error);
  }

  transaction.setSigners(
    // fee payed by the wallet owner
    wallet.publicKey,
    ...signers.map((s) => s.publicKey)
  );

  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  try {
    transaction = await wallet.signTransaction(transaction);
  } catch (error) {
    return failure(error);
  }

  let rawTransaction;
  try {
    rawTransaction = transaction.serialize();
  } catch (error) {
    return failure(error);
  }

  let result;
  try {
    result = await connection.sendRawTransaction(rawTransaction, {
      preflightCommitment: SINGLE,
    });
  } catch (error) {
    return failure(error);
  }

  return success(result);
}

/**
 * @param connection - the connection to the blockchain
 * @param wallet - the wallet (represents the person doing the transaction)
 * @param mintPublicKey - the mint public key
 * @param newAccount - the new account
 * @param amount - the amount to mint to the new account (optional)
 */
export async function createAndInitializeTokenAccount(
  connection: Connection,
  wallet: WalletType,
  mintPublicKey: PublicKey,
  newAccount: Account,
  amount = 0
): Promise<Result<TransactionSignature>> {
  const transaction = new Transaction();
  try {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          AccountLayout.span,
          SINGLE_GOSSIP
        ),
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );
  } catch (error) {
    return failure(error);
  }

  transaction.add(
    initializeAccount({
      account: newAccount.publicKey,
      mint: mintPublicKey,
      owner: wallet.publicKey,
    })
  );

  if (amount > 0) {
    transaction.add(
      mintTo({
        amount,
        destination: newAccount.publicKey,
        mint: mintPublicKey,
        mintAuthority: wallet.publicKey,
      })
    );
  }

  const signers = [newAccount];
  return await signAndSendTransaction(connection, transaction, wallet, signers);
}

interface InitLoanParams {
  connection: Connection /** represents the current connection */;
  expectedAmount: number /** the expected loan amount */;
  loanProgramId: string /** the id of the loan program */;
  loanMintAccount: string /** the mint account that represents the currency to be used */;
  wallet: WalletType /** the user wallet to sign and pay for the transaction */;
}

export const initLoan = async (params: InitLoanParams): Promise<Result<TransactionSignature>> => {
  const { connection, expectedAmount, wallet, loanMintAccount, loanProgramId } = params;
  const loanMintAccountKey = new PublicKey(loanMintAccount);
  const loanProgramIdKey = new PublicKey(loanProgramId);
  const transaction = new Transaction();

  // create the token account that will receive the loan if approved
  const loanReceiveAccount = new Account();
  try {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: loanReceiveAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          AccountLayout.span,
          SINGLE_GOSSIP
        ),
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );
  } catch (error) {
    return failure(error);
  }
  transaction.add(
    initializeAccount({
      account: loanReceiveAccount.publicKey,
      mint: loanMintAccountKey,
      owner: wallet.publicKey,
    })
  );
  const signers: Account[] = [loanReceiveAccount];

  // create loan account and make the program the owner
  const loanAccount = new Account();
  const applicationFee = APPLICATION_FEE * expectedAmount;
  try {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: loanAccount.publicKey,
        lamports:
          (await connection.getMinimumBalanceForRentExemption(
            LOAN_ACCOUNT_DATA_LAYOUT.span,
            SINGLE_GOSSIP
          )) + applicationFee,
        space: LOAN_ACCOUNT_DATA_LAYOUT.span,
        programId: loanProgramIdKey,
      })
    );
  } catch (error) {
    return failure(error);
  }
  signers.push(loanAccount);
  // this is the actual init loan transaction
  try {
    transaction.add(
      new TransactionInstruction({
        programId: loanProgramIdKey,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: loanMintAccountKey, isSigner: false, isWritable: true },
          { pubkey: loanReceiveAccount.publicKey, isSigner: false, isWritable: false },
          { pubkey: loanAccount.publicKey, isSigner: false, isWritable: true },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(0, ...new BN(expectedAmount).toArray(LE, 8))),
      })
    );
  } catch (error) {
    return failure(error);
  }

  return await signAndSendTransaction(connection, transaction, wallet, signers);
};

interface GuaranteeLoanParams {
  connection: Connection /** represents the current connection */;
  loanMintAccount: string /** the mint account that represents the currency to be used */;
  loanAccount: string /** the loan account */;
  loanCollateralAccount: string /** the token account that holds the loan collateral */;
  loanProgramId: string /** the id of the loan program */;
  wallet: WalletType /** the user wallet to sign and pay for the transaction */;
}

export const guaranteeLoan = async (
  params: GuaranteeLoanParams
): Promise<Result<TransactionSignature>> => {
  const {
    connection,
    loanMintAccount,
    loanAccount,
    loanCollateralAccount,
    loanProgramId,
    wallet,
  } = params;
  const loanAccountKey = new PublicKey(loanAccount);
  const loanMintAccountKey = new PublicKey(loanMintAccount);
  const loanCollateralAccountKey = new PublicKey(loanCollateralAccount);
  const loanProgramIdKey = new PublicKey(loanProgramId);
  const transaction = new Transaction();

  // create the token account that will receive the loan repayment
  const guarantorTokenAccount = new Account();
  try {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: guarantorTokenAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          AccountLayout.span,
          SINGLE_GOSSIP
        ),
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );
  } catch (error) {
    return failure(error);
  }
  transaction.add(
    initializeAccount({
      account: guarantorTokenAccount.publicKey,
      mint: loanMintAccountKey,
      owner: wallet.publicKey,
    })
  );
  const signers: Account[] = [guarantorTokenAccount];

  try {
    transaction.add(
      new TransactionInstruction({
        programId: loanProgramIdKey,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: loanCollateralAccountKey, isSigner: false, isWritable: true },
          { pubkey: guarantorTokenAccount.publicKey, isSigner: false, isWritable: true },
          { pubkey: loanAccountKey, isSigner: false, isWritable: true },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(1)),
      })
    );
  } catch (error) {
    return failure(error);
  }

  return await signAndSendTransaction(connection, transaction, wallet, signers);
};

interface AcceptLoanParams {
  borrowerReceiveAccount: string /** the token account that will receive the loan requested */;
  connection: Connection /** represents the current connection */;
  lenderFundsAccount: string /** the token account that holds the loan */;
  lenderRepaymentAccount: string /** the token account where repayment will be sent */;
  loanAccount: string /** the loan account */;
  loanProgramId: string /** the id of the loan program */;
  wallet: WalletType /** the user wallet to sign and pay for the transaction */;
}

export const acceptLoan = async (
  params: AcceptLoanParams
): Promise<Result<TransactionSignature>> => {
  const {
    borrowerReceiveAccount,
    connection,
    lenderFundsAccount,
    lenderRepaymentAccount,
    loanAccount,
    loanProgramId,
    wallet,
  } = params;
  const loanAccountKey = new PublicKey(loanAccount);
  const borrowerReceiveAccountKey = new PublicKey(borrowerReceiveAccount);
  const lenderFundsAccountKey = new PublicKey(lenderFundsAccount);
  const lenderRepaymentAccountKey = new PublicKey(lenderRepaymentAccount);
  const loanProgramIdKey = new PublicKey(loanProgramId);
  const transaction = new Transaction();

  try {
    transaction.add(
      new TransactionInstruction({
        programId: loanProgramIdKey,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: lenderFundsAccountKey, isSigner: false, isWritable: true },
          { pubkey: lenderRepaymentAccountKey, isSigner: false, isWritable: true },
          { pubkey: borrowerReceiveAccountKey, isSigner: false, isWritable: true },
          { pubkey: loanAccountKey, isSigner: false, isWritable: true },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(2)),
      })
    );
  } catch (error) {
    return failure(error);
  }

  const signers: Account[] = [];

  return await signAndSendTransaction(connection, transaction, wallet, signers);
};

interface RepayLoanParams {
  collateralTokenAccount: string /** the token account that holds the collateral */;
  connection: Connection /** represents the current connection */;
  guarantorAccount: string /** the loan guarantor's account */;
  guarantorTokenAccount: string /** the guarantor token account to pay fees into */;
  lenderAccount: string /** the lender's account */;
  lenderTokenAccount: string /** the lender token account to repay loan + fees into */;
  loanAccount: string /** the loan account */;
  loanProgramId: string /** the id of the loan program */;
  payerTokenAccount: string /** the token account that will be used to repay loan */;
  wallet: WalletType /** the user wallet to sign and pay for the transaction */;
}

export const repayLoan = async (params: RepayLoanParams): Promise<Result<TransactionSignature>> => {
  const {
    collateralTokenAccount,
    connection,
    guarantorAccount,
    guarantorTokenAccount,
    lenderAccount,
    lenderTokenAccount,
    loanAccount,
    loanProgramId,
    payerTokenAccount,
    wallet,
  } = params;
  const loanAccountKey = new PublicKey(loanAccount);
  const payerTokenAccountKey = new PublicKey(payerTokenAccount);
  const collateralTokenAccountKey = new PublicKey(collateralTokenAccount);
  const guarantorAccountKey = new PublicKey(guarantorAccount);
  const guarantorTokenAccountKey = new PublicKey(guarantorTokenAccount);
  const lenderAccountKey = new PublicKey(lenderAccount);
  const lenderTokenAccountKey = new PublicKey(lenderTokenAccount);
  const loanProgramIdKey = new PublicKey(loanProgramId);
  const transaction = new Transaction();
  // get the program derived address
  const pda = await PublicKey.findProgramAddress([Buffer.from(LOAN)], loanProgramIdKey);

  try {
    transaction.add(
      new TransactionInstruction({
        programId: loanProgramIdKey,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: payerTokenAccountKey, isSigner: false, isWritable: true },
          { pubkey: guarantorAccountKey, isSigner: false, isWritable: true },
          { pubkey: collateralTokenAccountKey, isSigner: false, isWritable: true },
          { pubkey: guarantorTokenAccountKey, isSigner: false, isWritable: true },
          { pubkey: lenderAccountKey, isSigner: false, isWritable: true },
          { pubkey: lenderTokenAccountKey, isSigner: false, isWritable: true },
          { pubkey: loanAccountKey, isSigner: false, isWritable: true },
          { pubkey: pda[0], isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(3)),
      })
    );
  } catch (error) {
    return failure(error);
  }

  const signers: Account[] = [];

  return await signAndSendTransaction(connection, transaction, wallet, signers);
};
