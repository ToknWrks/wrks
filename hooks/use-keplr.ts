"use client";

import { useState, useCallback, useEffect } from "react";
import { chains } from 'chain-registry';
import { bech32 } from 'bech32';
import { logError } from './use-error-handling';
import { useFetchWithRetry } from './use-fetch-with-retry';

// Fallback endpoints for commonly used chains
const FALLBACK_ENDPOINTS: { [key: string]: { rest: string; rpc: string } } = {
  'osmosis': {
    rest: 'https://rest.cosmos.directory/osmosis',
    rpc: 'https://rpc.cosmos.directory/osmosis'
  },
  'cosmoshub': {
    rest: 'https://rest.cosmos.directory/cosmoshub',
    rpc: 'https://rpc.cosmos.directory/cosmoshub'
  },
  'akash': {
    rest: 'https://rest.cosmos.directory/akash',
    rpc: 'https://rpc.cosmos.directory/akash'
  },
  'celestia': {
    rest: 'https://rest.cosmos.directory/celestia',
    rpc: 'https://rpc.cosmos.directory/celestia'
  },
  'regen': {
    rest: 'https://rest.cosmos.directory/regen',
    rpc: 'https://rpc.cosmos.directory/regen'
  },
  'juno': {
    rest: 'https://rest.cosmos.directory/juno',
    rpc: 'https://rpc.cosmos.directory/juno'
  },
  'dydx': {
    rest: 'https://rest.cosmos.directory/dydx',
    rpc: 'https://rpc.cosmos.directory/dydx'
  },
  'saga': {
    rest: 'https://rest.cosmos.directory/saga',
    rpc: 'https://rpc.cosmos.directory/saga'
  },
  'omniflixhub': {
    rest: 'https://rest.cosmos.directory/omniflixhub',
    rpc: 'https://rpc.cosmos.directory/omniflixhub'
  }
};

// Chain-specific denom configurations
const CHAIN_DENOMS: { [key: string]: string } = {
  'osmosis': 'uosmo',
  'cosmoshub': 'uatom',
  'akash': 'uakt',
  'celestia': 'utia',
  'regen': 'uregen',
  'juno': 'ujuno',
  'dydx': 'adydx',
  'saga': 'usaga',
  'omniflixhub': 'uflix'
};

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
  const chain = chains.find((c) => c.chain_name === chainName);

  if (!chain) {
    throw new Error(`Chain configuration not found for ${chainName}`);
  }

  const CHAIN_ID = chain.chain_id;
  const REST_URL = FALLBACK_ENDPOINTS[chainName]?.rest || chain.apis?.rest?.[0]?.address;
  const BASE_DENOM = CHAIN_DENOMS[chainName] || chain.fees?.fee_tokens[0]?.denom;
  const PREFIX = chain.bech32_prefix;

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

  const { fetchWithRetry } = useFetchWithRetry();

  const convertAddress = useCallback((address: string, toPrefix: string): string => {
    try {
      const decoded = bech32.decode(address);
      return bech32.encode(toPrefix, decoded.words);
    } catch (err) {
      console.error("Address conversion error:", err);
      return '';
    }
  }, []);

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const data = await fetchWithRetry(
        `${REST_URL}/cosmos/bank/v1beta1/balances/${address}`,
        undefined,
        `balance_${chainName}_${address}`
      );
      
      const balance = data.balances?.find((b: any) => b.denom === BASE_DENOM);
      const amount = balance ? (Number(balance.amount) / 1_000_000).toFixed(2) : "0.00";
      
      setState(prev => ({ ...prev, balance: amount }));
    } catch (err) {
      logError(err, 'Fetching balance');
      setState(prev => ({ ...prev, balance: "0.00" }));
    }
  }, [REST_URL, BASE_DENOM, chainName, fetchWithRetry]);

  const fetchDelegations = useCallback(async (address: string) => {
    try {
      const data = await fetchWithRetry(
        `${REST_URL}/cosmos/staking/v1beta1/delegations/${address}`,
        undefined,
        `delegations_${chainName}_${address}`
      );

      const delegationsData = data.delegation_responses || [];
      
      const delegationsWithNames = await Promise.all(
        delegationsData.map(async (delegation: any) => {
          try {
            const validatorData = await fetchWithRetry(
              `${REST_URL}/cosmos/staking/v1beta1/validators/${delegation.delegation.validator_address}`,
              undefined,
              `validator_${chainName}_${delegation.delegation.validator_address}`
            );
            return {
              ...delegation,
              validator_name: validatorData.validator.description.moniker
            };
          } catch {
            return {
              ...delegation,
              validator_name: "Unknown Validator"
            };
          }
        })
      );

      const totalStaked = delegationsWithNames.reduce((sum: number, delegation: any) => {
        return sum + (Number(delegation.balance.amount) / 1_000_000);
      }, 0);

      setState(prev => ({
        ...prev,
        delegations: delegationsWithNames,
        stakedBalance: totalStaked.toFixed(2)
      }));
    } catch (err) {
      logError(err, 'Fetching delegations');
      setState(prev => ({
        ...prev,
        delegations: [],
        stakedBalance: "0.00"
      }));
    }
  }, [REST_URL, chainName, fetchWithRetry]);

  const fetchUnclaimedRewards = useCallback(async (address: string) => {
    try {
      const data = await fetchWithRetry(
        `${REST_URL}/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
        undefined,
        `rewards_${chainName}_${address}`
      );
      
      const rewards = data.total?.find((r: any) => r.denom === BASE_DENOM);
      const amount = rewards ? (Number(rewards.amount) / 1_000_000).toFixed(2) : "0.00";
      
      setState(prev => ({ ...prev, unclaimedRewards: amount }));
    } catch (err) {
      logError(err, 'Fetching rewards');
      setState(prev => ({ ...prev, unclaimedRewards: "0.00" }));
    }
  }, [REST_URL, BASE_DENOM, chainName, fetchWithRetry]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    setState(prev => ({ ...prev, isLoading: true, status: 'Connecting', error: null }));

    try {
      if (!window.keplr) {
        throw new Error("Please install Keplr extension");
      }

      await window.keplr.enable(CHAIN_ID);
      const offlineSigner = window.keplr.getOfflineSigner(CHAIN_ID);
      
      const accounts = await offlineSigner.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const originalAddress = accounts[0].address;
      const userAddress = chainName === 'osmosis' 
        ? originalAddress 
        : convertAddress(originalAddress, PREFIX);

      if (!userAddress) {
        throw new Error("Failed to convert address");
      }

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
  }, [CHAIN_ID, chainName, PREFIX, convertAddress, fetchBalance, fetchDelegations, fetchUnclaimedRewards]);

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
        const key = await window.keplr.getKey(CHAIN_ID);
        if (key && state.status === 'Disconnected' && !state.isLoading) {
          connect();
        }
      } catch {
        // Silent fail for auto-connect
      }
    };

    autoConnect();
  }, [CHAIN_ID, connect, state.status, state.isLoading]);

  return {
    ...state,
    connect,
    disconnect,
    chainId: CHAIN_ID
  };
}