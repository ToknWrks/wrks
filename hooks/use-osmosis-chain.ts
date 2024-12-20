"use client";

import { useState, useCallback, useEffect } from "react";
import { chains } from 'chain-registry';

const osmosisChain = chains.find((chain) => chain.chain_name === 'osmosis');

if (!osmosisChain) {
  throw new Error('Osmosis chain configuration not found in chain-registry');
}

const OSMOSIS_LCD = osmosisChain.apis?.rest?.[0]?.address || "https://lcd.osmosis.zone";
const OSMO_DENOM = "uosmo";

interface DelegationResponse {
  delegation_responses: Array<{
    delegation: {
      delegator_address: string;
      validator_address: string;
      shares: string;
    };
    balance: {
      amount: string;
      denom: string;
    };
    validator_name?: string;
  }>;
}

interface ValidatorResponse {
  validator: {
    description: {
      moniker: string;
    };
  };
}

export function useOsmosisChain() {
  const { 
    address, 
    status,
    wallet,
    getOfflineSigner,
    chain: chainContext,
    isWalletConnected,
    isWalletConnecting 
  } = useChain("osmosis");

  const [balance, setBalance] = useState("0.00");
  const [stakedBalance, setStakedBalance] = useState("0.00");
  const [delegations, setDelegations] = useState<DelegationResponse['delegation_responses']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValidatorInfo = async (validatorAddress: string): Promise<string> => {
    try {
      const response = await fetch(`${OSMOSIS_LCD}/cosmos/staking/v1beta1/validators/${validatorAddress}`);
      if (!response.ok) {
        throw new Error("Failed to fetch validator info");
      }
      const data: ValidatorResponse = await response.json();
      return data.validator.description.moniker;
    } catch (err) {
      console.error("Error fetching validator info:", err);
      return "Unknown Validator";
    }
  };

  const fetchDelegations = useCallback(async () => {
    if (!address || !isWalletConnected) {
      setDelegations([]);
      setStakedBalance("0.00");
      return;
    }

    try {
      const response = await fetch(`${OSMOSIS_LCD}/cosmos/staking/v1beta1/delegations/${address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch delegations");
      }

      const data = await response.json();
      const delegationResponses = data.delegation_responses || [];

      if (!delegationResponses.length) {
        setDelegations([]);
        setStakedBalance("0.00");
        return;
      }

      const delegationsWithNames = await Promise.all(
        delegationResponses.map(async (delegation: any) => {
          const validatorName = await fetchValidatorInfo(delegation.delegation.validator_address);
          return {
            ...delegation,
            validator_name: validatorName
          };
        })
      );

      const totalStaked = delegationsWithNames.reduce((sum: number, delegation: any) => {
        return sum + (Number(delegation.balance.amount) / 1_000_000);
      }, 0);

      setDelegations(delegationsWithNames);
      setStakedBalance(totalStaked.toFixed(2));
      setError(null);
    } catch (err) {
      console.error("Error fetching delegations:", err);
      setDelegations([]);
      setStakedBalance("0.00");
    }
  }, [address, isWalletConnected]);

  const fetchBalance = useCallback(async () => {
    if (!address || !isWalletConnected) {
      setBalance("0.00");
      return;
    }

    try {
      const response = await fetch(`${OSMOSIS_LCD}/cosmos/bank/v1beta1/balances/${address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();
      const osmoBalance = data.balances?.find((b: any) => b.denom === OSMO_DENOM);
      const amount = osmoBalance ? Number(osmoBalance.amount) / 1_000_000 : 0;
      setBalance(amount.toFixed(2));
      setError(null);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance("0.00");
    }
  }, [address, isWalletConnected]);

  useEffect(() => {
    if (isWalletConnected && address) {
      setIsLoading(true);
      Promise.all([fetchBalance(), fetchDelegations()])
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setBalance("0.00");
      setStakedBalance("0.00");
      setDelegations([]);
    }
  }, [isWalletConnected, address, fetchBalance, fetchDelegations]);

  return {
    status,
    isLoading,
    error,
    balance,
    stakedBalance,
    delegations,
    isWalletConnected,
    isWalletConnecting,
    wallet,
    getOfflineSigner,
    chainContext
  };
}