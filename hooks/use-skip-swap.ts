"use client";

import { create } from 'zustand';
import { useKeplr } from './use-keplr';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { useEffect } from 'react';

const SKIP_API_URL = "https://api.skip.build/v2/";

// Token configuration for each chain
const CHAIN_TOKENS: { [chainId: string]: { denom: string; symbol: string; logo: string } } = {
  'osmosis-1': { 
    denom: 'uosmo', 
    symbol: 'OSMO',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png'
  },
  'cosmoshub-4': { 
    denom: 'uatom', 
    symbol: 'ATOM',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png'
  },
  'juno-1': { 
    denom: 'ujuno', 
    symbol: 'JUNO',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png'
  },
  'akash-1': { 
    denom: 'uakt', 
    symbol: 'AKT',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png'
  },
  'celestia-1': { 
    denom: 'utia', 
    symbol: 'TIA',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png'
  },
  'regen-1': { 
    denom: 'uregen', 
    symbol: 'REGEN',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png'
  },
  'dydx-mainnet-1': { 
    denom: 'adydx', 
    symbol: 'DYDX',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png'
  },
  'saga-1': { 
    denom: 'usaga', 
    symbol: 'SAGA',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.png'
  },
  'omniflixhub-1': { 
    denom: 'uflix', 
    symbol: 'FLIX',
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png'
  }
};

const NOBLE_USDC = {
  denom: 'noble-usdc',
  symbol: 'USDC',
  logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/usdc.png'
};

interface SwapState {
  fromToken: string;
  toToken: string;
  estimatedAmount: string;
  isLoading: boolean;
  isExecuting: boolean;
  error: string | null;
}

interface SwapStore extends SwapState {
  setFromToken: (token: string) => void;
  setToToken: (token: string) => void;
  setEstimatedAmount: (amount: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsExecuting: (executing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useSwapStore = create<SwapStore>((set) => ({
  fromToken: "",
  toToken: NOBLE_USDC.denom,
  estimatedAmount: "0",
  isLoading: false,
  isExecuting: false,
  error: null,
  setFromToken: (token) => set({ fromToken: token }),
  setToToken: (token) => set({ toToken: token }),
  setEstimatedAmount: (amount) => set({ estimatedAmount: amount }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsExecuting: (executing) => set({ isExecuting: executing }),
  setError: (error) => set({ error }),
  reset: () => set({
    fromToken: "",
    toToken: NOBLE_USDC.denom,
    estimatedAmount: "0",
    isLoading: false,
    isExecuting: false,
    error: null
  })
}));

export function useSkipSwap(chainName: string = 'osmosis') {
  const store = useSwapStore();
  const { address } = useKeplr(chainName);
  const { toast } = useToast();

  // Get chain-specific token configuration
  const chainId = chainName === 'cosmoshub' ? 'cosmoshub-4' : 
                 chainName === 'osmosis' ? 'osmosis-1' : 
                 chainName === 'omniflixhub' ? 'omniflixhub-1' :
                 `${chainName}-1`;
  const chainToken = CHAIN_TOKENS[chainId];

  // Set initial from token based on connected chain
  useEffect(() => {
    if (chainToken && store.fromToken !== chainToken.denom) {
      store.setFromToken(chainToken.denom);
    }
  }, [chainToken]);

  const getEstimate = async (amount: string) => {
    if (!amount || !address || !chainToken) return;

    store.setIsLoading(true);
    store.setError(null);

    try {
      const response = await axios.post(`${SKIP_API_URL}/fungible/route_estimate`, {
        source_asset_chain_id: chainId,
        source_asset_denom: store.fromToken,
        dest_asset_chain_id: "noble-1",
        dest_asset_denom: store.toToken,
        amount: (Number(amount) * 1_000_000).toString(),
        source_asset_type: "native",
        dest_asset_type: "native",
        cumulative_affiliate_fee_bps: "0",
        client_id: "toknwrks"
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      store.setEstimatedAmount((Number(response.data.estimated_amount) / 1_000_000).toFixed(6));
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Failed to get estimate");
    } finally {
      store.setIsLoading(false);
    }
  };

  const executeSwap = async (amount: string) => {
    if (!amount || !address || !chainToken) {
      toast({
        title: "Error",
        description: "Please connect your wallet and enter an amount",
        variant: "destructive"
      });
      return;
    }

    store.setIsExecuting(true);
    store.setError(null);

    try {
      const response = await axios.post(`${SKIP_API_URL}/fungible/route`, {
        source_asset_chain_id: chainId,
        source_asset_denom: store.fromToken,
        dest_asset_chain_id: "noble-1",
        dest_asset_denom: store.toToken,
        amount: (Number(amount) * 1_000_000).toString(),
        source_asset_type: "native",
        dest_asset_type: "native",
        address,
        client_id: "toknwrks",
        slippage_tolerance_percent: "1.0"
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: "Swap executed successfully"
      });

      store.reset();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to execute swap";
      store.setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      store.setIsExecuting(false);
    }
  };

  const switchTokens = () => {
    const fromToken = store.fromToken;
    const toToken = store.toToken;
    store.setFromToken(toToken);
    store.setToToken(fromToken);
    store.setEstimatedAmount("0");
    store.setError(null);
  };

  return {
    fromToken: store.fromToken,
    toToken: store.toToken,
    estimatedAmount: store.estimatedAmount,
    isLoading: store.isLoading,
    isExecuting: store.isExecuting,
    error: store.error,
    setFromToken: store.setFromToken,
    setToToken: store.setToToken,
    getEstimate,
    executeSwap,
    switchTokens,
    chainToken
  };
}