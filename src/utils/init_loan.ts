/* eslint-disable no-console, no-debugger, @typescript-eslint/no-unused-vars */
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Account,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { BASE10, LE, SINGLE_GOSSIP } from '../constants';
import { SOLANA_NETWORK_URL } from '../env';
import { LOAN_ACCOUNT_DATA_LAYOUT, LoanData, LoanLayout } from './layout';

const connection = new Connection(SOLANA_NETWORK_URL, SINGLE_GOSSIP);

export const initLoan = async (
  initializerPrivateKey: string,
  initializerFeeAccountAddress: string,
  loanApplicationFee: number,
  initializerReceiveLoanAddress: number,
  loanAccountAddress: string,
  expectedAmount: number,
  loanProgramId: string
): Promise<LoanData | undefined> => {
  const initializerFeeAccountKey = new PublicKey(initializerFeeAccountAddress);
  const initializerReceiveLoanAccountKey = new PublicKey(initializerReceiveLoanAddress);
  const loanAccountAccountKey = new PublicKey(loanAccountAddress);

  const feeAccountInfo = await connection.getParsedAccountInfo(
    initializerFeeAccountKey,
    SINGLE_GOSSIP
  );
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const feeAccountMint = (feeAccountInfo.value?.data as any).parsed.info.mint;
  if (!feeAccountMint) {
    return;
  }
  // get the mint pub key
  const feeAccountMintKey = new PublicKey(feeAccountMint);

  const privateKeyDecoded = initializerPrivateKey.split(',').map((s) => parseInt(s));
  const initializerAccount = new Account(privateKeyDecoded);

  const tempTokenAccount = new Account();
  const createTempTokenAccountIx = SystemProgram.createAccount({
    programId: TOKEN_PROGRAM_ID,
    space: AccountLayout.span,
    lamports: await connection.getMinimumBalanceForRentExemption(AccountLayout.span, SINGLE_GOSSIP),
    fromPubkey: initializerAccount.publicKey,
    newAccountPubkey: tempTokenAccount.publicKey,
  });

  const initTempAccountIx = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,
    feeAccountMintKey,
    tempTokenAccount.publicKey,
    initializerAccount.publicKey
  );
  const transferXTokensToTempAccIx = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    initializerFeeAccountKey,
    tempTokenAccount.publicKey,
    initializerAccount.publicKey,
    [],
    loanApplicationFee
  );

  const loanAccount = new Account();
  const loanProgramIdKey = new PublicKey(loanProgramId);

  const createLoanAccountIx = SystemProgram.createAccount({
    space: LOAN_ACCOUNT_DATA_LAYOUT.span,
    lamports: await connection.getMinimumBalanceForRentExemption(
      LOAN_ACCOUNT_DATA_LAYOUT.span,
      SINGLE_GOSSIP
    ),
    fromPubkey: initializerAccount.publicKey,
    newAccountPubkey: loanAccount.publicKey,
    programId: loanProgramIdKey,
  });

  const initLoanIx = new TransactionInstruction({
    programId: loanProgramIdKey,
    keys: [
      { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
      { pubkey: tempTokenAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: initializerReceiveLoanAccountKey, isSigner: false, isWritable: false },
      { pubkey: loanAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(Uint8Array.of(0, ...new BN(expectedAmount).toArray(LE, 8))),
  });

  const tx = new Transaction().add(
    createTempTokenAccountIx,
    initTempAccountIx,
    transferXTokensToTempAccIx,
    createLoanAccountIx,
    initLoanIx
  );
  await connection.sendTransaction(tx, [initializerAccount, tempTokenAccount, loanAccount], {
    skipPreflight: false,
    preflightCommitment: SINGLE_GOSSIP,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const encodedLoanState = (await connection.getAccountInfo(loanAccount.publicKey, SINGLE_GOSSIP))
    ?.data;
  const decodedLoanState = LOAN_ACCOUNT_DATA_LAYOUT.decode(encodedLoanState) as LoanLayout;

  if (!encodedLoanState) {
    return;
  }

  return {
    loanAccountPubkey: loanAccount.publicKey.toBase58(),
    isInitialized: !!decodedLoanState.isInitialized,
    initializerAccountPubkey: new PublicKey(decodedLoanState.initializerPubkey).toBase58(),
    XTokenTempAccountPubkey: new PublicKey(
      decodedLoanState.initializerTempTokenAccountPubkey
    ).toBase58(),
    initializerYTokenAccount: new PublicKey(
      decodedLoanState.initializerReceiveLoanPubkey
    ).toBase58(),
    expectedAmount: new BN(decodedLoanState.expectedAmount, BASE10, LE).toNumber(),
  };
};
