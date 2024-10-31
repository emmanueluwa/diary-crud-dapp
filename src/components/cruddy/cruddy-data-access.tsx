"use client";

import { getCruddyProgram, getCruddyProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";

interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

export function useCruddyProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getCruddyProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getCruddyProgram(provider);

  const accounts = useQuery({
    queryKey: ["cruddy", "all", { cluster }],
    queryFn: () => program.account.diaryEntryState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: [`diaryEntry`, `create`, { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods.createDiaryEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error creating entry: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
}

export function useCruddyProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useCruddyProgram();

  const accountQuery = useQuery({
    queryKey: ["cruddy", "fetch", { cluster, account }],
    queryFn: () => program.account.diaryEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: [`diaryEntry`, `update`, { cluster }],
    mutationFn: async ({ title, message }) => {
      return program.methods.updateDiaryEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error updating entry: ${error.message}`);
    },
  });

  const deleteEntry = useMutation({
    mutationKey: [`diaryEntry`, `delete`, { cluster }],
    mutationFn: (title: string) => {
      return program.methods.deleteDiaryEntry(title).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting entry: ${error.message}`);
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}
