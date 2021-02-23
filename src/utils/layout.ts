import BufferLayout from 'buffer-layout';

/**
 * Layout for a public key
 *
 * @param property - the property name
 */
const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 *
 * @param property - the property name
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
