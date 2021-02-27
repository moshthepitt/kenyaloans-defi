import { PublicKey } from '@solana/web3.js';
import type {
  AccountInfo,
  Connection,
  ParsedAccountData,
  PublicKeyAndAccount,
  RpcResponseAndContext,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from './token';
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

export interface LocalTokenAccount {
  id: string;
  info: {
    isNative: boolean;
    mint: string;
    owner: string;
    state: string;
    tokenAmount: {
      amount: string;
      decimals: number;
      uiAmount: number;
    };
  };
  lamports: number;
  owner: string;
}

interface GetTokenAccountsParams {
  accountPublicKey: PublicKey;
  connection: Connection;
}

type GetParsedTokenAccountsByOwnerResponse = RpcResponseAndContext<
  {
    pubkey: PublicKey;
    account: AccountInfo<ParsedAccountData>;
  }[]
>;

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

export const fetchTokenAccounts = async (
  params: GetTokenAccountsParams
): Promise<Result<GetParsedTokenAccountsByOwnerResponse>> => {
  const { accountPublicKey, connection } = params;
  try {
    return success(
      await connection.getParsedTokenAccountsByOwner(
        accountPublicKey,
        { programId: TOKEN_PROGRAM_ID },
        SINGLE
      )
    );
  } catch (error) {
    return failure(error);
  }
};

export const getTokenAccounts = async (
  params: GetTokenAccountsParams
): Promise<LocalTokenAccount[]> => {
  return fetchTokenAccounts(params).then((res) => {
    if (res.error) {
      throw res.error;
    }
    return res.value.value.map((item) => {
      return {
        id: item.pubkey.toBase58(),
        info: item.account.data.parsed.info,
        lamports: item.account.lamports,
        owner: item.account.owner.toBase58(),
      };
    });
  });
};
