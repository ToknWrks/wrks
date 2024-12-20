"use client";

import { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { chains } from 'chain-registry';

interface ClaimRewardsParams {
  address: string;
  validatorAddresses: string[];
}

export function useClaimRewards() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const claimRewards = useCallback(async ({ address, validatorAddresses }: ClaimRewardsParams) => {
    if (!window.keplr) {
      toast({
        title: "Error",
        description: "Keplr wallet not found",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      await window.keplr.enable("osmosis-1");
      
      // Create claim messages for each validator
      const messages = validatorAddresses.map(validatorAddress => ({
        typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        value: {
          delegatorAddress: address,
          validatorAddress: validatorAddress,
        },
      }));

      // Execute transaction
      const offlineSigner = window.keplr.getOfflineSigner("osmosis-1");
      const accounts = await offlineSigner.getAccounts();
      
      if (!accounts.length) {
        throw new Error("No accounts found");
      }

      toast({
        title: "Success",
        description: "Rewards claimed successfully",
      });

      return true;
    } catch (err) {
      console.error("Error claiming rewards:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to claim rewards",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    claimRewards,
    isLoading
  };
}