"use client";

import { useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { createClaimRewardsMessages } from '@/lib/messages/claim-rewards';
import { SUPPORTED_CHAINS } from '@/lib/constants/chains';

interface ClaimRewardsParams {
  chainName: string;
  address: string;
  delegations: any[];
  getSigningClient: () => Promise<any>;
}

export function useChainRewards() {
  const { toast } = useToast();

  const claimChainRewards = useCallback(async (params: ClaimRewardsParams) => {
    const { chainName, address, delegations, getSigningClient } = params;
    
    if (!address || !delegations.length) return false;

    try {
      const client = await getSigningClient();
      if (!client) throw new Error("Failed to get signing client");

      const validatorAddresses = delegations.map(d => d.delegation.validator_address);
      const messages = createClaimRewardsMessages({
        delegatorAddress: address,
        validatorAddresses
      });

      const chain = SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS];
      if (!chain) throw new Error(`Unsupported chain: ${chainName}`);

      const tx = await client.signAndBroadcast(
        address,
        messages,
        {
          amount: [{ amount: "5000", denom: chain.denom }],
          gas: "200000",
        }
      );

      if (tx.code !== 0) {
        throw new Error(tx.rawLog || 'Failed to claim rewards');
      }

      toast({
        title: "Success",
        description: `Successfully claimed ${chain.name} rewards`
      });

      return true;
    } catch (err) {
      console.error(`Error claiming ${chainName} rewards:`, err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to claim rewards",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    claimChainRewards
  };
}