"use client";

import { useState, useCallback, useEffect } from "react";
import { chains } from 'chain-registry';
import { serializeError, handleAxiosError } from './use-error-handling';
import axios from 'axios';

const cosmosHub = chains.find((chain) => chain.chain_name === 'cosmoshub');

if (!cosmosHub) {
  throw new Error('Cosmos Hub configuration not found in chain-registry');
}

const COSMOS_LCD = cosmosHub.apis?.rest?.[0]?.address || "https://rest.cosmos.directory/cosmoshub";
const ATOM_DENOM = "uatom";

interface CosmosHubState {
  balance: string;
  stakedBalance: string;
  unclaimedRewards: string;
  totalUsdValue: number;
  isLoading: boolean;
  error: string | null;
}

export function useCosmosHub(address?: string) {
  const [state, setState] = useState<CosmosHubState>({
    balance: "0",
    stakedBalance: "0",
    unclaimedRewards: "0",
    totalUsdValue: 0,
    isLoading: false,
    error: null
  });

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const response = await axios.get(`${COSMOS_LCD}/cosmos/bank/v1beta1/balances/${address}`);
      const atomBalance = response.data.balances?.find((b: any) => b.denom === ATOM_DENOM);
      return atomBalance ? (Number(atomBalance.amount) / 1_000_000).toFixed(6) : "0";
    } catch (err) {
      console.error("Error fetching balance:", err);
      throw err;
    }
  }, []);

  const fetchDelegations = useCallback(async (address: string) => {
    try {
      const response = await axios.get(`${COSMOS_LCD}/cosmos/staking/v1beta1/delegations/${address}`);
      const totalStaked = response.data.delegation_responses?.reduce((sum: number, del: any) => {
        return sum + (Number(del.balance.amount) / 1_000_000);
      }, 0) || 0;
      return totalStaked.toFixed(6);
    } catch (err) {
      console.error("Error fetching delegations:", err);
      throw err;
    }
  }, []);

  const fetchRewards = useCallback(async (address: string) => {
    try {
      const response = await axios.get(
        `${COSMOS_LCD}/cosmos/distribution/v1beta1/delegators/${address}/rewards`
      );
      const atomRewards = response.data.total?.find((r: any) => r.denom === ATOM_DENOM);
      return atomRewards ? (Number(atomRewards.amount) / 1_000_000).toFixed(6) : "0";
    } catch (err) {
      console.error("Error fetching rewards:", err);
      throw err;
    }
  }, []);

  const fetchAtomPrice = useCallback(async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=cosmos&vs_currencies=usd'
      );
      return response.data.cosmos.usd;
    } catch (err) {
      console.error("Error fetching ATOM price:", err);
      return 0;
    }
  }, []);

  useEffect(() => {
    if (!address) {
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return;
    }

    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const [balance, stakedBalance, rewards, atomPrice] = await Promise.all([
          fetchBalance(address),
          fetchDelegations(address),
          fetchRewards(address),
          fetchAtomPrice()
        ]);

        const total = (
          Number(balance) +
          Number(stakedBalance) +
          Number(rewards)
        ) * atomPrice;

        setState({
          balance,
          stakedBalance,
          unclaimedRewards: rewards,
          totalUsdValue: total,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: handleAxiosError(err)
        }));
      }
    };

    fetchData();
  }, [address, fetchBalance, fetchDelegations, fetchRewards, fetchAtomPrice]);

  return state;
}