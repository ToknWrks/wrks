"use client";

import { useState, useEffect } from 'react';
import { chains, assets } from 'chain-registry';

// Fallback endpoints if chain-registry endpoints are unavailable
const FALLBACK_ENDPOINTS: { [key: string]: { rest: string; rpc: string } } = {
  'osmosis': {
    rest: 'https://rest.cosmos.directory/osmosis',
    rpc: 'https://rpc.cosmos.directory/osmosis'
  },
  'cosmoshub': {
    rest: 'https://rest.cosmos.directory/cosmoshub',
    rpc: 'https://rpc.cosmos.directory/cosmoshub'
  },
  'archway': {
    rest: 'https://rest.cosmos.directory/archway',
    rpc: 'https://rpc.cosmos.directory/archway'
  }
};

// Chain-specific decimal configurations
const CHAIN_DECIMALS: { [key: string]: number } = {
  'archway': 18,  // Archway uses 18 decimals
  'osmosis': 6,
  'cosmoshub': 6,
  'celestia': 6,
  'akash': 6,
  'regen': 6,
  'juno': 6,
  'dydx': 18,  // dYdX also uses 18 decimals
  'saga': 6,
  'omniflixhub': 6
};

export interface ChainInfo {
  chainId: string;
  chainName: string;
  description: string;
  rpc: string;
  rest: string;
  denom: string;
  symbol: string;
  decimals: number;
  prefix: string;
  image?: string;
  isTestnet: boolean;
}

export function useChainInfo() {
  const [chainInfos, setChainInfos] = useState<{ [key: string]: ChainInfo }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChainInfo = async () => {
      try {
        const infos: { [key: string]: ChainInfo } = {};

        // Get all mainnet chains from chain-registry
        const mainnetChains = chains.filter(chain => 
          chain.network_type !== 'testnet' && 
          chain.status === 'live' &&
          chain.chain_name
        );

        // Process each chain
        for (const chain of mainnetChains) {
          try {
            // Get corresponding assets
            const chainAssets = assets.find(
              (asset) => asset.chain_name === chain.chain_name
            );

            if (!chainAssets?.assets?.length) {
              console.warn(`No assets found for ${chain.chain_name}`);
              continue;
            }

            // Get endpoints
            let rest = FALLBACK_ENDPOINTS[chain.chain_name]?.rest;
            let rpc = FALLBACK_ENDPOINTS[chain.chain_name]?.rpc;

            if (!rest || !rpc) {
              const restEndpoints = chain.apis?.rest?.filter(rest => 
                rest.address.startsWith('https') && 
                !rest.address.includes('localhost')
              );
              const rpcEndpoints = chain.apis?.rpc?.filter(rpc => 
                rpc.address.startsWith('https') && 
                !rpc.address.includes('localhost')
              );

              rest = rest || restEndpoints?.[0]?.address;
              rpc = rpc || rpcEndpoints?.[0]?.address;
            }

            // Skip if missing required endpoints
            if (!rest || !rpc) {
              console.warn(`Missing endpoints for ${chain.chain_name}`);
              continue;
            }

            // Get the main asset
            const mainAsset = chainAssets.assets[0];
            const baseDenom = mainAsset.base;
            
            if (!baseDenom) {
              console.warn(`No base denom found for ${chain.chain_name}`);
              continue;
            }

            // Get display properties
            const displayDenom = mainAsset.symbol?.toUpperCase() || '';
            const decimals = CHAIN_DECIMALS[chain.chain_name] || 
                           mainAsset.denom_units?.find(unit => unit.denom === displayDenom)?.exponent || 
                           6;

            // Get logo URL, preferring PNG over SVG
            const logoUrl = mainAsset.logo_URIs?.png || mainAsset.logo_URIs?.svg;

            // Add to infos if we have all required data
            if (displayDenom && chain.bech32_prefix) {
              infos[chain.chain_name] = {
                chainId: chain.chain_id,
                chainName: chain.pretty_name || chain.chain_name,
                description: chain.description || '',
                rpc,
                rest,
                denom: baseDenom,
                symbol: displayDenom,
                decimals,
                prefix: chain.bech32_prefix,
                image: logoUrl,
                isTestnet: false
              };
            }
          } catch (err) {
            console.warn(`Error processing chain ${chain.chain_name}:`, err);
            continue;
          }
        }

        setChainInfos(infos);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load chain information:', err);
        setError('Failed to load chain information');
        setIsLoading(false);
      }
    };

    loadChainInfo();
  }, []);

  return {
    chainInfos,
    isLoading,
    error
  };
}