export const SUPPORTED_CHAINS = {
  'osmosis': {
    name: 'Osmosis',
    chainId: 'osmosis-1',
    denom: 'uosmo',
    symbol: 'OSMO',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
    rest: 'https://rest.cosmos.directory/osmosis',
    rpc: 'https://rpc.cosmos.directory/osmosis'
  },
  'cosmoshub': {
    name: 'Cosmos Hub',
    chainId: 'cosmoshub-4',
    denom: 'uatom',
    symbol: 'ATOM',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    rest: 'https://rest.cosmos.directory/cosmoshub',
    rpc: 'https://rpc.cosmos.directory/cosmoshub'
  },
  'akash': {
    name: 'Akash',
    chainId: 'akashnet-2',  // Updated chain ID
    denom: 'uakt',
    symbol: 'AKT',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png',
    rest: 'https://rest.cosmos.directory/akash',
    rpc: 'https://rpc.cosmos.directory/akash'
  },
  'celestia': {
    name: 'Celestia',
    chainId: 'celestia-1',
    denom: 'utia',
    symbol: 'TIA',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png',
    rest: 'https://rest.cosmos.directory/celestia',
    rpc: 'https://rpc.cosmos.directory/celestia'
  },
  'regen': {
    name: 'Regen',
    chainId: 'regen-1',
    denom: 'uregen',
    symbol: 'REGEN',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png',
    rest: 'https://rest.cosmos.directory/regen',
    rpc: 'https://rpc.cosmos.directory/regen'
  },
  'juno': {
    name: 'Juno',
    chainId: 'juno-1',
    denom: 'ujuno',
    symbol: 'JUNO',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png',
    rest: 'https://rest.cosmos.directory/juno',
    rpc: 'https://rpc.cosmos.directory/juno'
  },
  'dydx': {
    name: 'dYdX',
    chainId: 'dydx-mainnet-1',
    denom: 'adydx',
    symbol: 'DYDX',
    decimals: 18,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png',
    rest: 'https://rest.cosmos.directory/dydx',
    rpc: 'https://rpc.cosmos.directory/dydx'
  },
  'saga': {
    name: 'Saga',
    chainId: 'saga-1',
    denom: 'usaga',
    symbol: 'SAGA',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.png',
    rest: 'https://rest.cosmos.directory/saga',
    rpc: 'https://rpc.cosmos.directory/saga'
  },
  'omniflixhub': {
    name: 'OmniFlix',
    chainId: 'omniflixhub-1',
    denom: 'uflix',
    symbol: 'FLIX',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png',
    rest: 'https://rest.cosmos.directory/omniflixhub',
    rpc: 'https://rpc.cosmos.directory/omniflixhub'
  }
} as const;

// Chain name mapping for routing
export const CHAIN_NAME_MAP = {
  'omniflix': 'omniflixhub',
  'cosmos': 'cosmoshub'
} as const;

// Helper to get chain info
export function getChainInfo(chainName: keyof typeof SUPPORTED_CHAINS) {
  return SUPPORTED_CHAINS[chainName];
}

// Helper to get internal chain name
export function getInternalChainName(path: string) {
  return CHAIN_NAME_MAP[path as keyof typeof CHAIN_NAME_MAP] || path;
}