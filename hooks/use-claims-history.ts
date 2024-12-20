"use client";

import { useState, useCallback } from "react";
import { skipApi } from "@/lib/api/skip";
import { format } from "date-fns";
import { formatNumber } from "@/lib/utils";
import { CHAIN_CONFIG } from "@/lib/constants";

export interface ClaimEvent {
  amount: string;
  timestamp: string;
  validatorName: string;
  usdValue: string;
  txHash: string;
}

export function useClaimsHistory(chainName: string = 'osmosis') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimsHistory = useCallback(async (address: string): Promise<ClaimEvent[]> => {
    if (!address) return [];
    
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await skipApi.getTransactions({
        chainName,
        address,
        type: "withdraw_delegator_reward"
      });

      if (!data?.txs?.length) {
        return [];
      }

      const chainConfig = CHAIN_CONFIG[chainName as keyof typeof CHAIN_CONFIG];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chainName}`);
      }

      const claims = await Promise.all(
        data.txs.map(async (tx: any) => {
          try {
            const { data: priceData } = await skipApi.getHistoricalPrice({
              chainName,
              timestamp: tx.timestamp,
              denom: chainConfig.denom
            });

            const amount = tx.messages.reduce((sum: number, msg: any) => {
              if (msg.type === "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward") {
                const tokenAmount = msg.amounts?.find((a: any) => a.denom === chainConfig.denom);
                return sum + (tokenAmount ? Number(tokenAmount.amount) : 0);
              }
              return sum;
            }, 0);

            const price = priceData?.price || 0;
            const usdValue = (amount * price) / Math.pow(10, chainConfig.decimals);

            return {
              amount: formatNumber(amount / Math.pow(10, chainConfig.decimals)),
              timestamp: format(new Date(tx.timestamp), "MMM d, yyyy HH:mm"),
              validatorName: tx.validator?.moniker || "Unknown Validator",
              usdValue: usdValue.toFixed(2),
              txHash: tx.hash
            };
          } catch (err) {
            console.warn(`Error processing tx ${tx.hash}:`, err);
            return null;
          }
        })
      );

      return claims
        .filter((claim): claim is ClaimEvent => claim !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load claims history";
      console.error("Error fetching claims history:", message);
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [chainName]);

  return {
    fetchClaimsHistory,
    isLoading,
    error
  };
}