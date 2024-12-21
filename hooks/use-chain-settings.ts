"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SUPPORTED_CHAINS } from '@/lib/constants/chains';

interface ChainSettingsState {
  enabledChains: Set<string>;
  setEnabledChains: (chains: string[]) => void;
  toggleChain: (chainName: string) => void;
  toggleAll: (chains: string[]) => void;
  isChainEnabled: (chainName: string) => boolean;
}

// Initialize with default enabled chains
const DEFAULT_ENABLED_CHAINS = Object.keys(SUPPORTED_CHAINS);

export const useChainSettingsStore = create<ChainSettingsState>()(
  persist(
    (set, get) => ({
      enabledChains: new Set(DEFAULT_ENABLED_CHAINS),
      setEnabledChains: (chains) => set({ enabledChains: new Set(chains) }),
      toggleChain: (chainName) => set((state) => {
        const newEnabledChains = new Set(state.enabledChains);
        if (newEnabledChains.has(chainName)) {
          newEnabledChains.delete(chainName);
        } else {
          newEnabledChains.add(chainName);
        }
        return { enabledChains: newEnabledChains };
      }),
      toggleAll: (chains) => set((state) => {
        const allEnabled = chains.every(chain => state.enabledChains.has(chain));
        return { enabledChains: new Set(allEnabled ? [] : chains) };
      }),
      isChainEnabled: (chainName) => get().enabledChains.has(chainName),
    }),
    {
      name: 'chain-settings',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              enabledChains: new Set(state.enabledChains)
            }
          };
        },
        setItem: (name, value) => {
          const { state } = value;
          const serializedState = {
            state: {
              ...state,
              enabledChains: Array.from(state.enabledChains)
            }
          };
          localStorage.setItem(name, JSON.stringify(serializedState));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export function useChainSettings() {
  const store = useChainSettingsStore();
  return {
    enabledChains: store.enabledChains,
    toggleChain: store.toggleChain,
    toggleAll: store.toggleAll,
    isChainEnabled: store.isChainEnabled,
  };
}