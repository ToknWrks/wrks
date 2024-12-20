import { chains } from 'chain-registry';

// Get chain info from chain-registry
const osmosis = chains.find(chain => chain.chain_name === 'osmosis');
const cosmos = chains.find(chain => chain.chain_name === 'cosmoshub');
const celestia = chains.find(chain => chain.chain_name === 'celestia');
const akash = chains.find(chain => chain.chain_name === 'akash');
const regen = chains.find(chain => chain.chain_name === 'regen');
const juno = chains.find(chain => chain.chain_name === 'juno');
const dydx = chains.find(chain => chain.chain_name === 'dydx');
const saga = chains.find(chain => chain.chain_name === 'saga');
const omniflix = chains.find(chain => chain.chain_name === 'omniflixhub');

export const NETWORKS = [
  {
    name: 'Osmosis',
    href: '/',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
    chainId: osmosis?.chain_id || 'osmosis-1'
  },
  {
    name: 'Cosmos Hub',
    href: '/cosmoshub',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    chainId: cosmos?.chain_id || 'cosmoshub-4'
  },
  {
    name: 'Celestia',
    href: '/celestia',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png',
    chainId: celestia?.chain_id || 'celestia-1'
  },
  {
    name: 'Akash',
    href: '/akash',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png',
    chainId: akash?.chain_id || 'akashnet-2'
  },
  {
    name: 'Regen',
    href: '/regen',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png',
    chainId: regen?.chain_id || 'regen-1'
  },
  {
    name: 'Juno',
    href: '/juno',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png',
    chainId: juno?.chain_id || 'juno-1'
  },
  {
    name: 'dYdX',
    href: '/dydx',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png',
    chainId: dydx?.chain_id || 'dydx-mainnet-1'
  },
  {
    name: 'Saga',
    href: '/saga',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.png',
    chainId: saga?.chain_id || 'saga-1'
  },
  {
    name: 'OmniFlix',
    href: '/omniflix',
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png',
    chainId: omniflix?.chain_id || 'omniflixhub-1'
  }
];