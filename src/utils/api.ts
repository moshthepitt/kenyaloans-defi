import { Connection, PublicKey, PublicKeyAndAccount } from '@solana/web3.js';
import { success, failure } from './types';
import type { Result } from './types';
import { unpackLoan } from './transform';
import type { LoanData } from './layout';
import { SINGLE } from '../constants';

interface GetLoanAccountsParams {
  connection: Connection;
  loanProgramId: string;
}

export interface LoanAccount extends LoanData {
  id: string;
}

export const fetchLoanAccounts = async (
  params: GetLoanAccountsParams
): Promise<Result<PublicKeyAndAccount<Buffer>[]>> => {
  const { connection, loanProgramId } = params;
  const loanProgramIdKey = new PublicKey(loanProgramId);
  try {
    return success(await connection.getProgramAccounts(loanProgramIdKey, SINGLE));
  } catch (error) {
    return failure(error);
  }
};

// export const getLoanAccounts = async (params: GetLoanAccountsParams): Promise<LoanAccount[]> => {
//   const fetched = await fetchLoanAccounts(params);
//   if (fetched.error) {
//     throw fetched.error;
//   }
//   return fetched.value.map((item) => {
//     return {
//       ...unpackLoan(item.account.data),
//       id: item.pubkey.toBase58(),
//     };
//   });
// };

export const getLoanAccounts = async (params: GetLoanAccountsParams): Promise<LoanAccount[]> => {
  return fetchLoanAccounts(params).then((res) => {
    if (res.error) {
      throw res.error;
    }
    return res.value.map((item) => {
      return {
        ...unpackLoan(item.account.data),
        id: item.pubkey.toBase58(),
      };
    });
  });
};
