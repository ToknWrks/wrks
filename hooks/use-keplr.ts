"use client";

import { useState, useCallback, useEffect } from 'react';
import { chains } from 'chain-registry';
import { bech32 } from 'bech32';
import { logError } from './use-error-handling';
import { useFetchWithRetry } from './use-fetch-with-retry';
import { SUPPORTED_CHAINS } from '@/lib/constants/chains';
import { fetchChainBalance, fetchChainDelegations, fetchChainRewards } from '@/lib/api/chain';

interface KeplrState {
  address: string;
  balance: string;
  stakedBalance: string;
  unclaimedRewards: string;
  delegations: any[];
  status: 'Connected' | 'Connecting' | 'Disconnected';
  isLoading: boolean;
  error: string | null;
}

export function useKeplr(chainName: string = 'osmosis') {
  const chain = SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS];
  if (!chain) {
    throw new Error(`Chain configuration not found for ${chainName}`);
  }

  const [state, setState] = useState<KeplrState>({
    address: "",
    balance: "0.00",
    stakedBalance: "0.00",
    unclaimedRewards: "0.00",
    delegations: [],
    status: 'Disconnected',
    isLoading: false,
    error: null
  });

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const balance = await fetchChainBalance(chain.rest, address, chain.denom, chain.decimals);
      setState(prev => ({ ...prev, balance }));
    } catch (err) {
      logError(err, 'Fetching balance');
    }
  }, [chain]);

  const fetchDelegations = useCallback(async (address: string) => {
    try {
      const { delegations, stakedBalance } = await fetchChainDelegations(chain.rest, address, chain.decimals);
      setState(prev => ({ ...prev, delegations, stakedBalance }));
    } catch (err) {
      logError(err, 'Fetching delegations');
    }
  }, [chain]);

  const fetchUnclaimedRewards = useCallback(async (address: string) => {
    try {
      const rewards = await fetchChainRewards(chain.rest, address, chain.denom, chain.decimals);
      setState(prev => ({ ...prev, unclaimedRewards: rewards }));
    } catch (err) {
      logError(err, 'Fetching rewards');
    }
  }, [chain]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    setState(prev => ({ ...prev, isLoading: true, status: 'Connecting', error: null }));

    try {
      if (!window.keplr) {
        throw new Error("Please install Keplr extension");
      }

      await window.keplr.enable(chain.chainId);
      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId);
      
      const accounts = await offlineSigner.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const userAddress = accounts[0].address;
      setState(prev => ({
        ...prev,
        address: userAddress,
        status: 'Connected'
      }));

      await Promise.all([
        fetchBalance(userAddress),
        fetchDelegations(userAddress),
        fetchUnclaimedRewards(userAddress)
      ]);
    } catch (err) {
      const message = logError(err, 'Connecting wallet');
      setState(prev => ({
        ...prev,
        error: message,
        status: 'Disconnected'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [chain.chainId, fetchBalance, fetchDelegations, fetchUnclaimedRewards]);

  const disconnect = useCallback(() => {
    setState({
      address: "",
      balance: "0.00",
      stakedBalance: "0.00",
      unclaimedRewards: "0.00",
      delegations: [],
      status: 'Disconnected',
      isLoading: false,
      error: null
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAccountChange = () => {
      if (state.status === 'Connected') {
        connect();
      }
    };

    window.addEventListener("keplr_keystorechange", handleAccountChange);
    return () => {
      window.removeEventListener("keplr_keystorechange", handleAccountChange);
    };
  }, [state.status, connect]);

  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window === "undefined" || !window.keplr) return;
      
      try {
        const key = await window.keplr.getKey(chain.chainId);
        if (key && state.status === 'Disconnected' && !state.isLoading) {
          connect();
        }
      } catch {
        // Silent fail for auto-connect
      }
    };

    autoConnect();
  }, [chain.chainId, connect, state.status, state.isLoading]);

  return {
    ...state,
    connect,
    disconnect,
    chainId: chain.chainId
  };
}