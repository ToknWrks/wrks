"use client";

import { bech32 } from 'bech32';
import { chains } from 'chain-registry';

export function convertAddress(address: string, toPrefix: string): string {
  try {
    const decoded = bech32.decode(address);
    return bech32.encode(toPrefix, decoded.words);
  } catch (err) {
    console.warn(`Failed to convert address to ${toPrefix}:`, err);
    return '';
  }
}

export function getAddressForChain(address: string | undefined, chainName: string): string {
  if (!address) return '';

  try {
    const chain = chains.find(c => c.chain_name === chainName);
    if (!chain) {
      console.warn(`Chain not found: ${chainName}`);
      return '';
    }

    // Get the prefix from the chain's bech32_prefix
    const prefix = chain.bech32_prefix;
    if (!prefix) {
      console.warn(`No bech32 prefix found for chain: ${chainName}`);
      return '';
    }

    return convertAddress(address, prefix);
  } catch (err) {
    console.warn(`Failed to get address for chain ${chainName}:`, err);
    return '';
  }
}