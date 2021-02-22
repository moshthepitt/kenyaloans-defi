/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
const BufferLayout: any = require('buffer-layout');
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

/**
 * Layout for a public key
 *
 * @param property
 */
const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 *
 * @param property
 */
const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property);
};

export const LOAN_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8('isInitialized'),
  BufferLayout.u8('status'),
  publicKey('initializerPubkey'),
  publicKey('initializerTempTokenAccountPubkey'),
  publicKey('initializerReceiveLoanPubkey'),
  publicKey('guarantorPubkey'),
  publicKey('collateralAccountPubkey'),
  publicKey('lenderPubkey'),
  publicKey('lenderLoanRepaymentPubkey'),
  uint64('expectedAmount'),
  uint64('amount'),
  BufferLayout.u32('interestRate'),
  BufferLayout.u32('duration'),
]);

export interface LoanLayout {
  isInitialized: number;
  status: number;
  initializerPubkey: Uint8Array;
  initializerTempTokenAccountPubkey: Uint8Array;
  initializerReceiveLoanPubkey: Uint8Array;
  loanAccountPubkey: Uint8Array;
  guarantorPubkey?: Uint8Array;
  collateralAccountPubkey?: Uint8Array;
  lenderPubkey?: Uint8Array;
  lenderLoanRepaymentPubkey?: Uint8Array;
  expectedAmount: Uint8Array;
  amount: Uint8Array;
  interestRate: Uint8Array;
  duration: Uint8Array;
}

export interface LoanData {
  isInitialized: boolean;
  status: number;
  initializerAccountPubkey: string;
  initializerTempTokenAccountPubkey: string;
  initializerReceiveLoanPubkey: string;
  loanAccountPubkey: string;
  expectedAmount: number;
  amount: number;
}
