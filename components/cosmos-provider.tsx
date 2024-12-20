"use client";

import * as React from "react";
import { Chain } from '@chain-registry/types';
import { ChainProvider } from '@cosmos-kit/react';
import { chains, assets } from 'chain-registry';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';

// Filter for Osmosis chain
const osmosisChain = chains.find((chain: Chain) => chain.chain_name === 'osmosis');
const osmosisAssets = assets.filter((asset) => asset.chain_name === 'osmosis');

if (!osmosisChain) {
  throw new Error('Osmosis chain configuration not found in chain-registry');
}

// Get endpoints from chain-registry
const rpcEndpoints = osmosisChain.apis?.rpc?.map(rpc => rpc.address) || [];
const restEndpoints = osmosisChain.apis?.rest?.map(rest => rest.address) || [];

if (!rpcEndpoints.length || !restEndpoints.length) {
  throw new Error('No endpoints found in chain-registry for Osmosis');
}

export function CosmosProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChainProvider
      chains={[osmosisChain]}
      assetLists={osmosisAssets}
      wallets={keplrWallets}
      signerOptions={{
        signingStargate: () => ({
          preferNoSetFee: false,
          preferNoSetMemo: true,
        }),
        signingCosmwasm: () => ({
          preferNoSetFee: false,
          preferNoSetMemo: true,
        })
      }}
      endpointOptions={{
        endpoints: {
          osmosis: {
            rpc: rpcEndpoints,
            rest: restEndpoints,
          }
        }
      }}
      walletConnectOptions={undefined}
    >
      {children}
    </ChainProvider>
  );
}