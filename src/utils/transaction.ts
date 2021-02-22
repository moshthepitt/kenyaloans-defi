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
import type { WalletType } from '../components/Wallet';
import { LE, MAX, SINGLE, SINGLE_GOSSIP } from '../constants';
import { success, failure } from './types';
import type { Result } from './types';
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
  loanApplicationAccount: string /** the token account that holds the loan application fee and to which the loan will be sent */;
  loanReceiveAccount: string /** the token account that will receive the loan requested */;
  wallet: WalletType /** the user wallet to sign and pay for the transaction */;
}

export const initLoan = async (params: InitLoanParams): Promise<Result<TransactionSignature>> => {
  const {
    connection,
    expectedAmount,
    wallet,
    loanApplicationAccount,
    loanReceiveAccount,
    loanProgramId,
  } = params;
  const loanApplicationAccountKey = new PublicKey(loanApplicationAccount);
  const loanReceiveAccountKey = new PublicKey(loanReceiveAccount);
  const loanProgramIdKey = new PublicKey(loanProgramId);
  const transaction = new Transaction();

  // create loan account and make the program the owner
  const loanAccount = new Account();
  try {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: loanAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(266, SINGLE_GOSSIP),
        space: 266,
        programId: loanProgramIdKey,
      })
    );
  } catch (error) {
    return failure(error);
  }

  try {
    transaction.add(
      new TransactionInstruction({
        programId: loanProgramIdKey,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          {
            pubkey: loanApplicationAccountKey,
            isSigner: false,
            isWritable: true,
          } /** temp token */,
          {
            pubkey: loanReceiveAccountKey,
            isSigner: false,
            isWritable: false,
          } /** receive loan */,
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

  const signers: Account[] = [loanAccount];

  return await signAndSendTransaction(connection, transaction, wallet, signers);
};
