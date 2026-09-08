// Pure transaction construction. No RPC: everything needed is passed in, so it can be tested exactly.
import { encodeFunctionData, encodePacked, keccak256, isAddress, isHex, type Address, type Hex } from 'viem'
import { factoryAbi } from './abi.ts'

export type Socials = { twitter: string; telegram: string; discord: string; website: string; farcaster: string }

export type TokenParams = {
  name: string
  symbol: string
  logo: string
  description: string
  socials: Socials
  creatorFeeRecipient: Address
  creatorTaxBps: number
  buybackEnabled: boolean
  expectedEconomics: Hex
  salt: Hex
}

export type PreparedTransaction = { chainId: number; to: Address; data: Hex; value: bigint }

export const EMPTY_SOCIALS: Socials = { twitter: '', telegram: '', discord: '', website: '', farcaster: '' }

export function encodeLaunchToken(input: {
  chainId: number
  factory: Address
  params: TokenParams
  launchConfigId: bigint
  pairToken: Address
  launchFee: bigint
}): PreparedTransaction {
  if (!isAddress(input.factory)) throw new Error('factory is not an address')
  if (!isHex(input.params.salt) || input.params.salt.length !== 66) throw new Error('salt must be 32 bytes')
  if (!isHex(input.params.expectedEconomics) || input.params.expectedEconomics.length !== 66) throw new Error('expectedEconomics must be 32 bytes')
  if (!Number.isInteger(input.params.creatorTaxBps) || input.params.creatorTaxBps < 0 || input.params.creatorTaxBps > 0xffff) throw new Error('creatorTaxBps out of range')
  if (!isAddress(input.pairToken)) throw new Error('pairToken is not an address')
  const data = encodeFunctionData({
    abi: factoryAbi,
    functionName: 'launchToken',
    args: [{ ...input.params, creatorTaxBps: input.params.creatorTaxBps }, input.launchConfigId, input.pairToken],
  })
  // The creation fee is msg.value whatever the pair: an ERC-20 pair prices the coin, it does not pay the fee.
  return { chainId: input.chainId, to: input.factory, data, value: input.launchFee }
}

// Canonical hash binding chain, target, calldata and value. Stored with the intent and compared on receipt.
export function transactionHashOfTerms(tx: PreparedTransaction): Hex {
  return keccak256(encodePacked(['uint256', 'address', 'bytes', 'uint256'], [BigInt(tx.chainId), tx.to, tx.data, tx.value]))
}
