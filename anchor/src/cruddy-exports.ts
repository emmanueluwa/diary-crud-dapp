// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CruddyIDL from '../target/idl/cruddy.json'
import type { Cruddy } from '../target/types/cruddy'

// Re-export the generated IDL and type
export { Cruddy, CruddyIDL }

// The programId is imported from the program IDL.
export const CRUDDY_PROGRAM_ID = new PublicKey(CruddyIDL.address)

// This is a helper function to get the Cruddy Anchor program.
export function getCruddyProgram(provider: AnchorProvider) {
  return new Program(CruddyIDL as Cruddy, provider)
}

// This is a helper function to get the program ID for the Cruddy program depending on the cluster.
export function getCruddyProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Cruddy program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return CRUDDY_PROGRAM_ID
  }
}
