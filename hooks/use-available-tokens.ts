"use client";

import { useState, useEffect, useCallback } from 'react';
import { useKeplr } from './use-keplr';
import { useTokenState } from './use-token-state';
import axios from 'axios';

export interface Token {
  denom: string;
  symbol: string;
  name: string;
  logo?: string;
  decimals: number;
  balance?: string;
}

const OSMOSIS_LCD = "https://lcd.osmosis.zone";

const NATIVE_TOKENS: { [key: string]: Omit<Token, 'denom' | 'balance'> } = {
  uosmo: {
    symbol: 'OSMO',
    name: 'Osmosis',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png'
  },
  uusdc: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.png'
  }
};

export function useAvailableTokens() {
  const { address, status } = useKeplr();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tokens, setTokens, updateBalance, clear } = useTokenState();

  const fetchTokens = useCallback(async () => {
    if (!address || status !== 'Connected') {
      clear();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [balanceResponse, denomsResponse] = await Promise.all([
        axios.get(`${OSMOSIS_LCD}/cosmos/bank/v1beta1/balances/${address}`),
        axios.get(`${OSMOSIS_LCD}/osmosis/tokenfactory/v1beta1/denoms`)
      ]);

      const tokenMap: { [denom: string]: Token } = {};

      balanceResponse.data.balances.forEach((balance: any) => {
        const metadata = denomsResponse.data.denoms?.find(
          (d: any) => d.denom === balance.denom
        );

        // Handle native tokens
        if (NATIVE_TOKENS[balance.denom]) {
          const nativeToken = NATIVE_TOKENS[balance.denom];
          tokenMap[balance.denom] = {
            denom: balance.denom,
            ...nativeToken,
            balance: (Number(balance.amount) / Math.pow(10, nativeToken.decimals)).toFixed(6)
          };
          return;
        }

        // Handle other tokens with metadata
        if (metadata) {
          const decimals = metadata.decimals || 6;
          tokenMap[balance.denom] = {
            denom: balance.denom,
            symbol: metadata.symbol,
            name: metadata.name,
            decimals,
            balance: (Number(balance.amount) / Math.pow(10, decimals)).toFixed(6),
            logo: metadata.logo_uri
          };
        }
      });

      setTokens(tokenMap);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to fetch available tokens');
    } finally {
      setIsLoading(false);
    }
  }, [address, status, setTokens, clear]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const sortedTokens = Object.values(tokens)
    .map(token => ({
      ...token,
      denom: token.denom || '',
    }))
    .sort((a, b) => {
      const aBalance = Number(a.balance || 0);
      const bBalance = Number(b.balance || 0);
      return bBalance - aBalance;
    });

  return {
    tokens: sortedTokens,
    isLoading,
    error,
    refreshTokens: fetchTokens
  };
}