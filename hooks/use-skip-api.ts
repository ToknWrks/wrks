"use client";

import { useState, useCallback } from 'react';
import { useKeplr } from './use-keplr';
import axios from 'axios';

const SKIP_API_URL = "https://api.skip.money/v1";

export function useSkipApi() {
  const { address, signingClient } = useKeplr();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimRewards = useCallback(async () => {
    if (!address || !signingClient) {
      setError("Wallet not connected");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get route from Skip API
      const routeResponse = await axios.post(`${SKIP_API_URL}/cosmos/osmosis/route`, {
        messages: [{
          type: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
          value: {
            delegator_address: address,
            validator_address: "osmovaloper1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep88n0y4" // Example validator
          }
        }],
        sender: address
      });

      if (!routeResponse.data?.route) {
        throw new Error("Invalid route response");
      }

      // Execute the transaction
      const result = await signingClient.signAndBroadcast(
        address,
        routeResponse.data.route.msgs,
        routeResponse.data.route.fee
      );

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to claim rewards";
      console.error("Skip API Error:", err);
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [address, signingClient]);

  return {
    claimRewards,
    isProcessing,
    error,
  };
}