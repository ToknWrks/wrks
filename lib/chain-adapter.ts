import { Chain as ChainRegistryChain } from '@chain-registry/types';
import { Chain as CosmosKitChain } from '@cosmos-kit/core/node_modules/@chain-registry/types';

export function adaptChainToCosmosKit(chain: ChainRegistryChain): CosmosKitChain {
  return {
    ...chain,
    chain_type: 'mainnet',
    status: chain.status || 'live', // Ensure status is always defined
    network_type: chain.network_type || 'mainnet', // Ensure network_type is defined
    pretty_name: chain.pretty_name || chain.chain_name, // Ensure pretty_name is defined
    chain_id: chain.chain_id || '', // Ensure chain_id is defined
    bech32_prefix: chain.bech32_prefix || '', // Ensure bech32_prefix is defined
  } as CosmosKitChain;
}