import { PublicKey, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import BufferLayout from 'buffer-layout';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u8('decimals'),
    BufferLayout.blob(32, 'mintAuthority'),
    BufferLayout.u8('freezeAuthorityOption'),
    BufferLayout.blob(32, 'freezeAuthority'),
  ]),
  'initializeMint'
);
LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
LAYOUT.addVariant(3, BufferLayout.struct([BufferLayout.nu64('amount')]), 'transfer');
LAYOUT.addVariant(7, BufferLayout.struct([BufferLayout.nu64('amount')]), 'mintTo');
LAYOUT.addVariant(8, BufferLayout.struct([BufferLayout.nu64('amount')]), 'burn');
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');

const instructionMaxSpan = Math.max(...Object.values(LAYOUT.registry).map((r: any) => r.span));

/**
 * @param instruction - the instruction to be encoded
 */
function encodeTokenInstructionData(instruction: any): Buffer {
  const b = Buffer.alloc(instructionMaxSpan);
  const span = LAYOUT.encode(instruction, b);
  return b.slice(0, span);
}

interface InitializeAccountParams {
  account: PublicKey;
  mint: PublicKey;
  owner: PublicKey;
}

/**
 * @param params - the parameters to be used for the instruction
 */
export function initializeAccount(params: InitializeAccountParams): TransactionInstruction {
  const { account, mint, owner } = params;

  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];
  return new TransactionInstruction({
    keys,
    data: encodeTokenInstructionData({
      initializeAccount: {},
    }),
    programId: TOKEN_PROGRAM_ID,
  });
}

interface MintToParams {
  mint: PublicKey;
  destination: PublicKey;
  amount: number;
  mintAuthority: PublicKey;
}

/**
 * @param params - the parameters to be used for the instruction
 */
export function mintTo(params: MintToParams): TransactionInstruction {
  const { amount, destination, mint, mintAuthority } = params;
  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
  ];
  return new TransactionInstruction({
    keys,
    data: encodeTokenInstructionData({
      mintTo: {
        amount,
      },
    }),
    programId: TOKEN_PROGRAM_ID,
  });
}

interface InitializeMintParams {
  mint: PublicKey;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey;
}

/**
 * @param params - the parameters to be used for the instruction
 */
export function initializeMint(params: InitializeMintParams): TransactionInstruction {
  const { mint, decimals, mintAuthority, freezeAuthority } = params;
  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];
  return new TransactionInstruction({
    keys,
    data: encodeTokenInstructionData({
      initializeMint: {
        decimals,
        mintAuthority: mintAuthority.toBuffer(),
        freezeAuthorityOption: !!freezeAuthority,
        freezeAuthority: freezeAuthority.toBuffer(),
      },
    }),
    programId: TOKEN_PROGRAM_ID,
  });
}
