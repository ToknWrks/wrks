"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import axios from "axios";

const SKIP_API_URL = "https://api.skip.build/v2/";

interface ClaimEvent {
  amount: string;
  timestamp: string;
  hash: string;
  usdValue?: string;
}

export function useSkipHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimHistory = useCallback(async (address: string): Promise<ClaimEvent[]> => {
    if (!address) {
      setError("No address provided.");
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${SKIP_API_URL}/cosmos/osmosis/txs`, {
        params: {
          address,
          type: "withdraw_delegator_reward",
          limit: 100,
        },
      });

      if (!response.data || !response.data.txs) {
        setError("No transactions found.");
        return [];
      }

      const claims = await Promise.all(
        response.data.txs.map(async (tx: any) => {
          try {
            const priceResponse = await axios.get(`${SKIP_API_URL}/cosmos/osmosis/price`, {
              params: {
                timestamp: tx.timestamp,
                denom: "uosmo",
              },
            });

            const amount = tx.messages.reduce((sum: number, msg: any) => {
              if (msg.type === "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward") {
                const osmoAmount = msg.amounts?.find((a: any) => a.denom === "uosmo");
                return sum + (osmoAmount ? Number(osmoAmount.amount) : 0);
              }
              return sum;
            }, 0);

            const price = priceResponse.data?.price || 0;
            const usdValue = (amount * price) / 1_000_000;

            return {
              amount: (amount / 1_000_000).toFixed(6),
              timestamp: format(new Date(tx.timestamp), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
              hash: tx.hash,
              usdValue: `$${usdValue.toFixed(2)}`,
            };
          } catch (innerErr) {
            console.error(
              `Error processing transaction ${tx.hash}:`,
              JSON.stringify(innerErr, Object.getOwnPropertyNames(innerErr))
            );
            return null;
          }
        })
      );

      return claims
        .filter((claim): claim is ClaimEvent => claim !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (outerErr) {
      if (axios.isAxiosError(outerErr)) {
        const status = outerErr.response?.status;
        if (status === 404) {
          setError("Data not found for the specified address.");
        } else {
          setError(`Unexpected error occurred: ${outerErr.message}`);
        }
      } else {
        setError("An unknown error occurred.");
      }

      console.error("Skip API Request Error:", JSON.stringify(outerErr, Object.getOwnPropertyNames(outerErr)));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchClaimHistory,
    isLoading,
    error,
  };
}
