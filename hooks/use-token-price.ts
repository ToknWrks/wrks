"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PRICE_CACHE_KEY = 'token_prices_cache';

interface PriceCache {
  [chainId: string]: {
    price: number;
    timestamp: number;
  };
}

const CHAIN_TO_COINGECKO_ID: { [key: string]: string } = {
  'osmosis': 'osmosis',
  'cosmoshub': 'cosmos',
  'celestia': 'celestia',
  'akash': 'akash-network',
  'regen': 'regen',
  'juno': 'juno-network',
  'dydx': 'dydx',
  'saga': 'saga-2',
  'omniflixhub': 'omniflix-network',
  'stargaze': 'stargaze',
  'stride': 'stride',
  'sentinel': 'sentinel',
  'archway': 'archway',
  'noble': 'noble',
  'persistence': 'persistence',
  'evmos': 'evmos',
  'injective': 'injective-protocol',
  'secret': 'secret',
  'terra': 'terra-luna-2',
  'kujira': 'kujira'
};

export function useTokenPrice(chainName: string = 'osmosis') {
  const [cache, setCache] = useState<PriceCache>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const cached = localStorage.getItem(PRICE_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const getCachedPrice = useCallback((chainId: string) => {
    const cachedData = cache[chainId];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.price;
    }
    return null;
  }, [cache]);

  const updateCache = useCallback((chainId: string, price: number) => {
    const newCache = {
      ...cache,
      [chainId]: {
        price,
        timestamp: Date.now()
      }
    };
    setCache(newCache);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(newCache));
      } catch (err) {
        console.warn('Failed to cache price:', err);
      }
    }
  }, [cache]);

  const fetchPrice = useCallback(async (chainId: string): Promise<number> => {
    const coingeckoId = CHAIN_TO_COINGECKO_ID[chainId];
    if (!coingeckoId) {
      console.warn(`No Coingecko ID mapping for chain: ${chainId}`);
      return 0;
    }

    try {
      const cachedPrice = getCachedPrice(chainId);
      if (cachedPrice !== null) {
        return cachedPrice;
      }

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
        { timeout: 5000 }
      );
      
      const price = response.data[coingeckoId]?.usd || 0;
      updateCache(chainId, price);
      return price;
    } catch (err) {
      console.warn(`Error fetching ${chainId} price:`, err);
      return getCachedPrice(chainId) || 0;
    }
  }, [getCachedPrice, updateCache]);

  const formatUsdValue = useCallback(async (amount: string | number): Promise<string> => {
    if (!amount) return '$0.00';
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '$0.00';

    try {
      const price = await fetchPrice(chainName);
      const value = numericAmount * price;
      return `$${value.toFixed(2)}`;
    } catch (err) {
      console.warn('Error formatting USD value:', err);
      return '$0.00';
    }
  }, [chainName, fetchPrice]);

  return {
    formatUsdValue,
    fetchPrice
  };
}