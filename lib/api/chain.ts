import { logError } from '@/lib/error-handling';
import { retryFetch } from '@/lib/utils/fetch';
import { SUPPORTED_CHAINS } from '@/lib/constants/chains';

export async function fetchChainBalance(restUrl: string, address: string, denom: string, decimals: number = 6) {
  try {
    const response = await retryFetch(`${restUrl}/cosmos/bank/v1beta1/balances/${address}`);
    const data = await response.json();
    
    // Validate response data
    if (!Array.isArray(data?.balances)) {
      throw new Error('Invalid balance data received');
    }

    const balance = data.balances.find((b: any) => b.denom === denom);
    return balance ? (Number(balance.amount) / Math.pow(10, decimals)).toFixed(decimals) : "0.00";
  } catch (err) {
    logError(err, 'Fetching balance', true);
    return "0.00";
  }
}

export async function fetchChainDelegations(restUrl: string, address: string, decimals: number = 6) {
  try {
    const response = await retryFetch(`${restUrl}/cosmos/staking/v1beta1/delegations/${address}`);
    const data = await response.json();
    
    // Validate response data
    if (!Array.isArray(data?.delegation_responses)) {
      throw new Error('Invalid delegation data received');
    }

    const delegations = data.delegation_responses;

    // Fetch validator info with concurrency limit
    const delegationsWithInfo = await Promise.all(
      delegations.map(async (delegation: any) => {
        try {
          const validatorInfo = await fetchValidatorInfo(restUrl, delegation.delegation.validator_address);
          return {
            ...delegation,
            validator: {
              ...validatorInfo,
              address: delegation.delegation.validator_address
            }
          };
        } catch (err) {
          // Continue with fallback validator info
          return {
            ...delegation,
            validator: {
              name: "Unknown Validator",
              identity: "",
              website: "",
              details: "",
              commission: "0",
              address: delegation.delegation.validator_address
            }
          };
        }
      })
    );

    const totalStaked = delegationsWithInfo.reduce((sum: number, del: any) => {
      return sum + (Number(del.balance.amount) / Math.pow(10, decimals));
    }, 0);

    return {
      delegations: delegationsWithInfo,
      stakedBalance: totalStaked.toFixed(decimals)
    };
  } catch (err) {
    logError(err, 'Fetching delegations', true);
    return {
      delegations: [],
      stakedBalance: "0.00"
    };
  }
}

export async function fetchChainRewards(restUrl: string, address: string, denom: string, decimals: number = 6) {
  try {
    const response = await retryFetch(`${restUrl}/cosmos/distribution/v1beta1/delegators/${address}/rewards`);
    const data = await response.json();
    
    // Validate response data
    if (!Array.isArray(data?.total)) {
      throw new Error('Invalid rewards data received');
    }

    const rewards = data.total.find((r: any) => r.denom === denom);
    return rewards ? (Number(rewards.amount) / Math.pow(10, decimals)).toFixed(decimals) : "0.00";
  } catch (err) {
    logError(err, 'Fetching rewards', true);
    return "0.00";
  }
}