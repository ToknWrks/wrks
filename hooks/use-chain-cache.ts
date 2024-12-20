"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChainBalance {
  available: string;
  staked: string;
  rewards: string;
  chainInfo: {
    chainName: string;
    symbol: string;
    image?: string;
  };
}

interface ChainCache {
  balances: { [chainName: string]: ChainBalance };
  lastUpdated: number;
  setBalances: (balances: { [chainName: string]: ChainBalance }) => void;
  getBalances: () => { [chainName: string]: ChainBalance };
  clear: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

export const useChainCache = create<ChainCache>()(
  persist(
    (set, get) => ({
      balances: {},
      lastUpdated: 0,
      setBalances: (balances) => set({ balances, lastUpdated: Date.now() }),
      getBalances: () => {
        const state = get();
        const now = Date.now();
        // Return cached data if less than cache duration old
        if (now - state.lastUpdated < CACHE_DURATION) {
          return state.balances;
        }
        return {};
      },
      clear: () => set({ balances: {}, lastUpdated: 0 }),
    }),
    {
      name: 'chain-balances-cache',
      version: 1,
      partialize: (state) => ({
        balances: state.balances,
        lastUpdated: state.lastUpdated
      })
    }
  )
);