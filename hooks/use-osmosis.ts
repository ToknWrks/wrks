"use client";

import { useChain } from "@cosmos-kit/react";
import { useState, useCallback, useEffect } from "react";
import { StargateClient } from "@cosmjs/stargate";
import { osmosis } from "osmojs";

const OSMOSIS_RPC = "https://rpc.osmosis.zone";
const OSMOSIS_LCD = "https://lcd.osmosis.zone";
const OSMO_DENOM = "uosmo";

export function useOsmosis() {
  const { address, status, client, getSigningStargateClient } = useChain("osmosis");
  const [balance, setBalance] = useState("0");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [delegations, setDelegations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address || !client) return;

    try {
      const response = await fetch(`${OSMOSIS_LCD}/cosmos/bank/v1beta1/balances/${address}`);
      const data = await response.json();
      const osmoBalance = data.balances.find((b: any) => b.denom === OSMO_DENOM);
      const amount = osmoBalance ? Number(osmoBalance.amount) / 1_000_000 : 0;
      setBalance(amount.toFixed(2));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance("0");
    }
  }, [address, client]);

  const fetchDelegations = useCallback(async () => {
    if (!address || !client) return;

    try {
      const response = await fetch(`${OSMOSIS_LCD}/cosmos/staking/v1beta1/delegations/${address}`);
      const data = await response.json();
      setDelegations(data.delegation_responses || []);

      const totalStaked = (data.delegation_responses || []).reduce((sum: number, del: any) => {
        return sum + (Number(del.balance.amount) / 1_000_000);
      }, 0);

      setStakedBalance(totalStaked.toFixed(2));
    } catch (err) {
      console.error("Error fetching delegations:", err);
      setDelegations([]);
      setStakedBalance("0");
    }
  }, [address, client]);

  useEffect(() => {
    if (status === "Connected") {
      setIsLoading(true);
      Promise.all([fetchBalance(), fetchDelegations()])
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [status, fetchBalance, fetchDelegations]);

  return {
    address,
    status,
    balance,
    stakedBalance,
    delegations,
    isLoading,
    error,
    client,
    getSigningStargateClient,
  };
}