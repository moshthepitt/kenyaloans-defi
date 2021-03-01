import {
  Account,
  Connection,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import { AccountLayout, MintLayout } from '@solana/spl-token';
import type { WalletType } from '../utils/state';
import type { Result } from '../utils/types';
import { failure } from '../utils/types';
import { signAndSendTransaction } from '../utils/transaction';
import { initializeAccount, initializeMint, mintTo, TOKEN_PROGRAM_ID } from '../utils/token';

interface CreateMintParams {
  connection: Connection;
  wallet: WalletType /**Wallet for paying fees and allowed to mint new tokens*/;
  mint: Account /** Account to hold token information*/;
  decimals: number;
  initialAccounts: Array<{
    account: Account;
    amount: number;
  }>;
}

export const createAndInitializeMint = async (
  params: CreateMintParams
): Promise<Result<TransactionSignature>> => {
  const { connection, wallet, mint, decimals, initialAccounts } = params;
  const transaction = new Transaction();

  try {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );
  } catch (error) {
    return failure(error);
  }

  transaction.add(
    initializeMint({
      mint: mint.publicKey,
      decimals,
      freezeAuthority: wallet.publicKey,
      mintAuthority: wallet.publicKey,
    })
  );
  const signers = [mint];

  let minAmount: number;
  try {
    minAmount = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  } catch (error) {
    return failure(error);
  }

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
        mint: mint.publicKey,
        owner: wallet.publicKey,
      })
    );
    transaction.add(
      mintTo({
        mint: mint.publicKey,
        destination: item.account.publicKey,
        amount: item.amount,
        mintAuthority: wallet.publicKey,
      })
    );
  });

  return await signAndSendTransaction(connection, transaction, wallet, signers);
};
