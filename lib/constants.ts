// Message type constants
export const MESSAGE_TYPES = {
  WITHDRAW_REWARD: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  DELEGATE: '/cosmos.staking.v1beta1.MsgDelegate',
  UNDELEGATE: '/cosmos.staking.v1beta1.MsgUndelegate'
} as const;

// Chain configuration
export const CHAIN_CONFIG = {
  osmosis: {
    denom: 'uosmo',
    symbol: 'OSMO',
    decimals: 6,
    explorer: 'https://www.mintscan.io/osmosis'
  },
  cosmoshub: {
    denom: 'uatom', 
    symbol: 'ATOM',
    decimals: 6,
    explorer: 'https://www.mintscan.io/cosmos'
  }
} as const;