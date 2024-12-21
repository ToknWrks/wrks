"use client";

import { useState, useCallback } from 'react';
import { useKeplr } from './use-keplr';
import { useToast } from "@/components/ui/use-toast";

export function useClaimRewards(chainName: string = 'osmosis') {
  const [isLoading, setIsLoading] = useState(false);
  const { address, getSigningClient } = useKeplr(chainName);
  const { toast } = useToast();

  const claimRewards = useCallback(async (validatorAddresses: string[]) => {
    if (!address || !validatorAddresses.length) {
      toast({
        title: "Error",
        description: "No validators selected for claiming rewards",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      const client = await getSigningClient();
      if (!client) {
        throw new Error("Failed to get signing client");
      }

      // Create claim messages for each validator
      const messages = validatorAddresses.map(validatorAddress => ({
        typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        value: {
          delegatorAddress: address,
          validatorAddress,
        },
      }));

      // Execute transaction
      const tx = await client.signAndBroadcast(
        address,
        messages,
        {
          amount: [{ amount: "5000", denom: chainName === 'osmosis' ? "uosmo" : "uatom" }],
          gas: "200000",
        }
      );

      if (tx.code !== 0) {
        throw new Error(tx.rawLog || 'Failed to claim rewards');
      }

      toast({
        title: "Success",
        description: "Successfully claimed rewards"
      });

      // Refresh the page to update balances
      window.location.reload();
      
      return true;
    } catch (err) {
      console.error('Error claiming rewards:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to claim rewards",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, getSigningClient, chainName, toast]);

  return {
    claimRewards,
    isLoading
  };
}