// Token configurations
export const CHAIN_DENOMS = {
  'osmosis': 'uosmo',
  'cosmoshub': 'uatom',
  'akash': 'uakt',
  'celestia': 'utia',
  'regen': 'uregen',
  'juno': 'ujuno',
  'dydx': 'adydx',
  'saga': 'usaga',
  'omniflixhub': 'uflix'
} as const;

// Noble USDC configuration
export const NOBLE_USDC = {
  denom: 'noble-usdc',
  symbol: 'USDC',
  name: 'USD Coin',
  logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/usdc.svg'
} as const;