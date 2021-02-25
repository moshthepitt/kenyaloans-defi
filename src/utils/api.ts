import { Connection, PublicKey, PublicKeyAndAccount } from '@solana/web3.js';
import { success, failure } from './types';
import type { Result } from './types';
import { SINGLE } from '../constants';

interface GetLoanAccountsParams {
  connection: Connection;
  loanProgramId: string;
}

export const getLoanAccounts = async (
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
