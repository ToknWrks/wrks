"use client";

import { useState, useEffect } from 'react';
import { useChainInfo } from './use-chain-info';
import { getAddressForChain } from './use-address-converter';
import { useChainCache } from './use-chain-cache';
import { useChainSettings } from './use-chain-settings';
import { useTokenPrice } from './use-token-price';
import axios from 'axios';
import { logError } from './use-error-handling';

interface ChainBalance {
  available: string;
  staked: string;
  rewards: string;
  usdValues: {
    available: string;
    staked: string;
    rewards: string;
    total: string;
  };
  chainInfo: {
    chainName: string;
    symbol: string;
    image?: string;
  };
}

interface MultiChainBalances {
  [chainName: string]: ChainBalance;
}

const REQUEST_TIMEOUT = 15000;

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
  'omniflixhub': 'uflix',
  'stargaze': 'ustars',
  'stride': 'ustrd',
  'sentinel': 'udvpn',
  'persistence': 'uxprt',
  'secret': 'uscrt',
  'terra': 'uluna',
  'kujira': 'ukuji'
};

export function useMultiChainBalances(osmosisAddress?: string) {
  const [balances, setBalances] = useState<MultiChainBalances>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingChains, setLoadingChains] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const { chainInfos } = useChainInfo();
  const { enabledChains } = useChainSettings();
  const { getBalances: getCachedBalances, setBalances: setCachedBalances } = useChainCache();
  const { fetchPrice } = useTokenPrice();

  useEffect(() => {
    const fetchBalances = async () => {
      if (!osmosisAddress || !Object.keys(chainInfos).length) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const cachedBalances = getCachedBalances();
      if (Object.keys(cachedBalances).length > 0) {
        setBalances(cachedBalances);
      }

      const newBalances: MultiChainBalances = {};
      const loadingChainsSet = new Set<string>();

      try {
        const enabledChainInfos = Object.entries(chainInfos)
          .filter(([chainName]) => enabledChains.has(chainName));

        await Promise.all(
          enabledChainInfos.map(async ([chainName, info]) => {
            try {
              const chainAddress = getAddressForChain(osmosisAddress, chainName);
              if (!chainAddress) {
                console.warn(`Failed to convert address for ${chainName}`);
                return;
              }

              loadingChainsSet.add(chainName);
              setLoadingChains(new Set(loadingChainsSet));

              const denom = CHAIN_DENOMS[chainName] || info.denom;
              const decimals = info.decimals || 6;

              const [balanceRes, stakingRes, rewardsRes] = await Promise.all([
                axios.get(`${info.rest}/cosmos/bank/v1beta1/balances/${chainAddress}`, { timeout: REQUEST_TIMEOUT }),
                axios.get(`${info.rest}/cosmos/staking/v1beta1/delegations/${chainAddress}`, { timeout: REQUEST_TIMEOUT }),
                axios.get(`${info.rest}/cosmos/distribution/v1beta1/delegators/${chainAddress}/rewards`, { timeout: REQUEST_TIMEOUT })
              ]);

              const availableBalance = balanceRes.data.balances?.find(
                (b: any) => b.denom === denom
              );

              const stakedAmount = stakingRes.data.delegation_responses?.reduce(
                (sum: number, del: any) => sum + Number(del.balance.amount),
                0
              );

              const rewards = rewardsRes.data.total?.find(
                (r: any) => r.denom === denom
              );

              const available = availableBalance 
                ? (Number(availableBalance.amount) / Math.pow(10, decimals)).toFixed(decimals)
                : "0";
              const staked = stakedAmount
                ? (Number(stakedAmount) / Math.pow(10, decimals)).toFixed(decimals)
                : "0";
              const rewardsAmount = rewards
                ? (Number(rewards.amount) / Math.pow(10, decimals)).toFixed(decimals)
                : "0";

              const price = await fetchPrice(chainName);
              const usdValues = {
                available: (Number(available) * price).toFixed(2),
                staked: (Number(staked) * price).toFixed(2),
                rewards: (Number(rewardsAmount) * price).toFixed(2),
                total: ((Number(available) + Number(staked) + Number(rewardsAmount)) * price).toFixed(2)
              };

              if (Number(available) > 0 || Number(staked) > 0 || Number(rewardsAmount) > 0) {
                newBalances[chainName] = {
                  available,
                  staked,
                  rewards: rewardsAmount,
                  usdValues,
                  chainInfo: {
                    chainName: info.chainName,
                    symbol: info.symbol,
                    image: info.image
                  }
                };
              }
            } catch (err) {
              logError(err, `Failed to fetch ${chainName} balances`, true);
            } finally {
              loadingChainsSet.delete(chainName);
              setLoadingChains(new Set(loadingChainsSet));
            }
          })
        );

        setBalances(newBalances);
        setCachedBalances(newBalances);
      } catch (err) {
        const errorMessage = logError(err, 'Fetching multi-chain balances');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        setLoadingChains(new Set());
      }
    };

    fetchBalances();
  }, [osmosisAddress, chainInfos, enabledChains, getCachedBalances, setCachedBalances, fetchPrice]);

  return {
    balances,
    isLoading,
    loadingChains,
    error
  };
}