"use client";

import { useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useKeplr } from './use-keplr';
import { useChainSettings } from './use-chain-settings';
import { SUPPORTED_CHAINS } from '@/lib/constants/chains';
import { getClaimRoute } from '@/lib/api/skip';
import { SigningStargateClient } from "@cosmjs/stargate";

export function useMultiChainRewards() {
  const { toast } = useToast();
  const { enabledChains } = useChainSettings();
  const { address: osmosisAddress } = useKeplr('osmosis');

  const claimAllRewards = useCallback(async () => {
    if (!osmosisAddress || !window.keplr) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return {};
    }

    const results: { [chainName: string]: boolean } = {};

    try {
      // Get delegations for each chain
      const claimPromises = Array.from(enabledChains).map(async (chainName) => {
        const chain = SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS];
        if (!chain) return null;

        try {
          // Enable chain and get signer
          await window.keplr.enable(chain.chainId);
          const offlineSigner = window.keplr.getOfflineSigner(chain.chainId);
          const client = await SigningStargateClient.connectWithSigner(chain.rpc, offlineSigner);

          // Get delegations to find validators with rewards
          const delegationsResponse = await fetch(
            `${chain.rest}/cosmos/distribution/v1beta1/delegators/${osmosisAddress}/rewards`
          );
          const delegationsData = await delegationsResponse.json();

          // Filter validators with rewards
          const validatorsWithRewards = delegationsData.rewards?.filter(
            (r: any) => r.reward?.length > 0
          ).map((r: any) => r.validator_address) || [];

          if (!validatorsWithRewards.length) return null;

          // Get claim route from Skip
          const route = await getClaimRoute({
            address: osmosisAddress,
            validatorAddresses: validatorsWithRewards,
            sourceChainId: chain.chainId
          });

          // Execute transaction
          const tx = await client.signAndBroadcast(
            osmosisAddress,
            route.msgs,
            route.fee
          );

          if (tx.code !== 0) {
            throw new Error(tx.rawLog || 'Failed to claim rewards');
          }

          results[chainName] = true;
          
          toast({
            title: "Success",
            description: `Successfully claimed ${chain.name} rewards`
          });

          return {
            chainName,
            success: true
          };
        } catch (err) {
          console.error(`Error claiming ${chainName} rewards:`, err);
          toast({
            title: "Error",
            description: `Failed to claim ${chain.name} rewards: ${err instanceof Error ? err.message : 'Unknown error'}`,
            variant: "destructive"
          });
          results[chainName] = false;
          return null;
        }
      });

      await Promise.all(claimPromises);
    } catch (err) {
      console.error('Error claiming rewards:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to claim rewards",
        variant: "destructive"
      });
    }

    return results;
  }, [enabledChains, osmosisAddress, toast]);

  return {
    claimAllRewards
  };
}