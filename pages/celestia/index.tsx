"use client";

import { Header } from "@/components/dashboard/header";
import { useKeplr } from "@/hooks/use-keplr";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DelegationsCard } from "@/components/dashboard/delegations-card";
import { RewardsChart } from "@/components/dashboard/rewards-chart";
import { ChainInfo } from "@/components/dashboard/chain-info";
import { CoinsIcon, DollarSignIcon, PiggyBankIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useEffect } from "react";

export default function CelestiaPage() {
  const {
    address,
    status,
    balance,
    stakedBalance,
    unclaimedRewards,
    isLoading,
    error,
    connect
  } = useKeplr('celestia');

  // Auto-connect when page loads
  useEffect(() => {
    if (status === 'Disconnected' && !isLoading) {
      connect();
    }
  }, [status, isLoading, connect]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header chainName="celestia" />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Celestia Dashboard</h1>
        </div>

        {!status || status === 'Disconnected' ? (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to view your Celestia balances and rewards
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Available TIA"
                type="available"
                value={Number(balance)}
                icon={<CoinsIcon className="h-4 w-4 text-muted-foreground" />}
                description="Available balance in your wallet"
                isLoading={isLoading}
                tokenSymbol="TIA"
                chainName="celestia"
              />
              <StatsCard
                title="Staked TIA"
                type="staked"
                value={Number(stakedBalance)}
                icon={<PiggyBankIcon className="h-4 w-4 text-muted-foreground" />}
                description="Total TIA staked"
                isLoading={isLoading}
                tokenSymbol="TIA"
                chainName="celestia"
              />
              <StatsCard
                title="Unclaimed Rewards"
                type="unclaimed"
                value={Number(unclaimedRewards)}
                icon={<CoinsIcon className="h-4 w-4 text-muted-foreground" />}
                description="Claimable staking rewards"
                isLoading={isLoading}
                tokenSymbol="TIA"
                chainName="celestia"
              />
              <StatsCard
                title="Total Value"
                type="converted"
                value={Number(balance) + Number(stakedBalance) + Number(unclaimedRewards)}
                icon={<DollarSignIcon className="h-4 w-4 text-muted-foreground" />}
                description="Total value of all TIA"
                isLoading={isLoading}
                tokenSymbol="TIA"
                chainName="celestia"
              />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <DelegationsCard chainName="celestia" />
              <RewardsChart chainName="celestia" />
            </div>

            <ChainInfo chainName="celestia" />
          </>
        )}
      </main>
    </div>
  );
}