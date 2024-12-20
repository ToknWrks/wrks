"use client";

import { useState, useCallback } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function useOsmosisContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.keplr) {
        throw new Error("Please install Keplr extension");
      }

      await window.keplr.enable("osmosis-1");
      const offlineSigner = window.keplr.getOfflineSigner("osmosis-1");
      
      const client = await SigningCosmWasmClient.connectWithSigner(
        "https://rpc.osmosis.zone",
        offlineSigner,
        { gasPrice: GasPrice.fromString("0.025uosmo") }
      );

      return client;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      return null;
    }
  }, []);

  const updateAutoConvertPercentage = useCallback(async (percentage: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const client = await connectWallet();
      if (!client || !CONTRACT_ADDRESS) return;

      const msg = {
        update_auto_convert_percentage: {
          percentage: percentage.toString(),
        },
      };

      await client.execute(
        window.keplr.defaultAddress,
        CONTRACT_ADDRESS,
        msg,
        "auto"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  }, [connectWallet]);

  const collectAndConvert = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const client = await connectWallet();
      if (!client || !CONTRACT_ADDRESS) return;

      const msg = {
        collect_and_convert: {},
      };

      await client.execute(
        window.keplr.defaultAddress,
        CONTRACT_ADDRESS,
        msg,
        "auto"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  }, [connectWallet]);

  return {
    isLoading,
    error,
    updateAutoConvertPercentage,
    collectAndConvert,
  };
}