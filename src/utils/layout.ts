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
 * Layout for am optiona; public key
 *
 * @param property - the property name
 */
const optionalPublicKey = (property = 'optionalPublicKey') => {
  return BufferLayout.blob(36, property);
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
  publicKey('applicationFeeAccountPubkey'),
  publicKey('initializerReceiveLoanPubkey'),
  optionalPublicKey('guarantorPubkey'),
  optionalPublicKey('guarantorRepaymentAccountPubkey'),
  optionalPublicKey('collateralAccountPubkey'),
  optionalPublicKey('lenderPubkey'),
  optionalPublicKey('lenderRepaymentPubkey'),
  uint64('expectedAmount'),
  uint64('amount'),
  BufferLayout.u32('interestRate'),
  BufferLayout.u32('duration'),
]);

export interface LoanLayout {
  isInitialized: number;
  status: number;
  initializerPubkey: Uint8Array;
  applicationFeeAccountPubkey: Uint8Array;
  initializerReceiveLoanPubkey: Uint8Array;
  guarantorPubkey: Uint8Array;
  guarantorRepaymentAccountPubkey: Uint8Array;
  collateralAccountPubkey: Uint8Array;
  lenderPubkey: Uint8Array;
  lenderRepaymentPubkey: Uint8Array;
  expectedAmount: Uint8Array;
  amount: Uint8Array;
  interestRate: number;
  duration: number;
}

export interface LoanData {
  isInitialized: boolean;
  status: number;
  initializerPubkey: string;
  applicationFeeAccountPubkey: string;
  initializerReceiveLoanPubkey: string;
  guarantorPubkey?: string;
  guarantorRepaymentAccountPubkey?: string;
  collateralAccountPubkey?: string;
  lenderPubkey?: string;
  lenderRepaymentPubkey?: string;
  expectedAmount: number;
  amount: number;
  interestRate: number;
  duration: number;
}
