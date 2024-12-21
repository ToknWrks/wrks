import { SUPPORTED_CHAINS, CHAIN_NAME_MAP } from '@/lib/constants/chains';

export const NETWORKS = Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => ({
  name: chain.name,
  // Use the external path for routing
  href: key === 'osmosis' ? '/' : `/${Object.entries(CHAIN_NAME_MAP).find(([_, v]) => v === key)?.[0] || key}`,
  icon: chain.icon,
  chainId: chain.chainId
}));