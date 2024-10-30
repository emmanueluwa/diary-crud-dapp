'use client'

import {getCruddyProgram, getCruddyProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useCruddyProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCruddyProgramId(cluster.network as Cluster), [cluster])
  const program = getCruddyProgram(provider)

  const accounts = useQuery({
    queryKey: ['cruddy', 'all', { cluster }],
    queryFn: () => program.account.cruddy.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['cruddy', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ cruddy: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useCruddyProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCruddyProgram()

  const accountQuery = useQuery({
    queryKey: ['cruddy', 'fetch', { cluster, account }],
    queryFn: () => program.account.cruddy.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['cruddy', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ cruddy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['cruddy', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ cruddy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['cruddy', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ cruddy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['cruddy', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ cruddy: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
