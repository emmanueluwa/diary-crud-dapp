import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Cruddy} from '../target/types/cruddy'

describe('cruddy', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Cruddy as Program<Cruddy>

  const cruddyKeypair = Keypair.generate()

  it('Initialize Cruddy', async () => {
    await program.methods
      .initialize()
      .accounts({
        cruddy: cruddyKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([cruddyKeypair])
      .rpc()

    const currentCount = await program.account.cruddy.fetch(cruddyKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Cruddy', async () => {
    await program.methods.increment().accounts({ cruddy: cruddyKeypair.publicKey }).rpc()

    const currentCount = await program.account.cruddy.fetch(cruddyKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Cruddy Again', async () => {
    await program.methods.increment().accounts({ cruddy: cruddyKeypair.publicKey }).rpc()

    const currentCount = await program.account.cruddy.fetch(cruddyKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Cruddy', async () => {
    await program.methods.decrement().accounts({ cruddy: cruddyKeypair.publicKey }).rpc()

    const currentCount = await program.account.cruddy.fetch(cruddyKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set cruddy value', async () => {
    await program.methods.set(42).accounts({ cruddy: cruddyKeypair.publicKey }).rpc()

    const currentCount = await program.account.cruddy.fetch(cruddyKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the cruddy account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        cruddy: cruddyKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.cruddy.fetchNullable(cruddyKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
