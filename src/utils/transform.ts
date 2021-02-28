import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { LOAN_ACCOUNT_DATA_LAYOUT } from './layout';
import type { LoanLayout, LoanData } from './layout';
import { LE } from '../constants';

export const unpackNumber = (input: Uint8Array): number => {
  return new BN(input, 10, LE).toNumber();
};

export const unpackPublicKey = (input: Uint8Array): PublicKey => {
  return new PublicKey(input);
};

export const unpackOptionalPublicKey = (input: Uint8Array): PublicKey | undefined => {
  const array = Array.from(input);
  const tag = array.slice(0, 4);
  const body = array.slice(4);

  if (JSON.stringify(tag) == JSON.stringify([1, 0, 0, 0])) {
    return unpackPublicKey(Uint8Array.from(body));
  } else {
    return;
  }
};

export const unpackLoan = (input: Buffer): LoanData => {
  const unpacked = LOAN_ACCOUNT_DATA_LAYOUT.decode(input) as LoanLayout;

  const unpackedGuarantorPubkey = unpackOptionalPublicKey(unpacked.guarantorPubkey);
  const guarantorPubkey = unpackedGuarantorPubkey ? unpackedGuarantorPubkey.toBase58() : undefined;
  const unpackedGuarantorRepaymentAccountPubkey = unpackOptionalPublicKey(
    unpacked.guarantorRepaymentAccountPubkey
  );
  const guarantorRepaymentAccountPubkey = unpackedGuarantorRepaymentAccountPubkey
    ? unpackedGuarantorRepaymentAccountPubkey.toBase58()
    : undefined;
  const unpackedCollateralAccountPubkey = unpackOptionalPublicKey(unpacked.collateralAccountPubkey);
  const collateralAccountPubkey = unpackedCollateralAccountPubkey
    ? unpackedCollateralAccountPubkey.toBase58()
    : undefined;
  const unpackedLenderPubkey = unpackOptionalPublicKey(unpacked.lenderPubkey);
  const lenderPubkey = unpackedLenderPubkey ? unpackedLenderPubkey.toBase58() : undefined;
  const unpackedLenderRepaymentPubkey = unpackOptionalPublicKey(unpacked.lenderRepaymentPubkey);
  const lenderRepaymentPubkey = unpackedLenderRepaymentPubkey
    ? unpackedLenderRepaymentPubkey.toBase58()
    : undefined;

  const result = {
    ...unpacked,
    isInitialized: !!unpacked.isInitialized,
    initializerPubkey: unpackPublicKey(unpacked.initializerPubkey).toBase58(),
    loanMintPubkey: unpackPublicKey(unpacked.loanMintPubkey).toBase58(),
    initializerReceiveLoanPubkey: unpackPublicKey(unpacked.initializerReceiveLoanPubkey).toBase58(),
    guarantorPubkey,
    guarantorRepaymentAccountPubkey,
    collateralAccountPubkey,
    lenderPubkey,
    lenderRepaymentPubkey,
    expectedAmount: unpackNumber(unpacked.expectedAmount),
    amount: unpackNumber(unpacked.amount),
  };

  return result as LoanData;
};
