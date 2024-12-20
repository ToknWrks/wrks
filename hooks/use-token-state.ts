"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Token {
  symbol: string;
  name: string;
  logo?: string;
  decimals: number;
  balance?: string;
}

interface TokenState {
  tokens: Record<string, Token>;
  setTokens: (tokens: Record<string, Token>) => void;
  updateBalance: (denom: string, balance: string) => void;
  clear: () => void;
}

export const useTokenState = create<TokenState>()(
  persist(
    (set) => ({
      tokens: {},
      setTokens: (tokens) => set({ tokens }),
      updateBalance: (denom, balance) =>
        set((state) => ({
          tokens: {
            ...state.tokens,
            [denom]: {
              ...state.tokens[denom],
              balance,
            },
          },
        })),
      clear: () => set({ tokens: {} }),
    }),
    {
      name: 'token-storage',
    }
  )
);