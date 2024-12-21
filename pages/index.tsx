"use client";

import { Header } from "@/components/dashboard/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RewardsChart } from "@/components/dashboard/rewards-chart";
import { DelegationsCard } from "@/components/dashboard/delegations-card";
import { ChainInfo } from "@/components/dashboard/chain-info";
import { CoinsIcon, DollarSignIcon, PiggyBankIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { useKeplr } from "@/hooks/use-keplr";

export default function Dashboard() {
  const [totalClaimedValue, setTotalClaimedValue] = useState(0);
  const {
    status,
    balance,
    stakedBalance,
    unclaimedRewards,
    isLoading,
    error
  } = useKeplr();

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 space-y-4 p-8 pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Osmosis Dashboard</h1>
        </div>

        {!status || status === 'Disconnected' ? (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to view your Osmosis balances and rewards
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Available OSMO"
                type="available"
                value={Number(balance)}
                icon={<CoinsIcon className="h-4 w-4 text-muted-foreground" />}
                description="Available balance in your wallet"
                isLoading={isLoading}
                tokenSymbol="OSMO"
                chainName="osmosis"
              />
              <StatsCard
                title="Staked OSMO"
                type="staked"
                value={Number(stakedBalance)}
                icon={<PiggyBankIcon className="h-4 w-4 text-muted-foreground" />}
                description="Total OSMO staked"
                isLoading={isLoading}
                tokenSymbol="OSMO"
                chainName="osmosis"
              />
              <StatsCard
                title="Unclaimed Rewards"
                type="unclaimed"
                value={Number(unclaimedRewards)}
                icon={<CoinsIcon className="h-4 w-4 text-muted-foreground" />}
                description="Estimated Tax"
                isLoading={isLoading}
                tokenSymbol="OSMO"
                chainName="osmosis"
              />
              <StatsCard
                title="Total Value"
                type="converted"
                value={totalClaimedValue}
                icon={<DollarSignIcon className="h-4 w-4 text-muted-foreground" />}
                description="Value of all OSMO"
                isLoading={isLoading}
                tokenSymbol="OSMO"
                chainName="osmosis"
              />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <DelegationsCard onTotalClaimedChange={setTotalClaimedValue} />
              <RewardsChart />
            </div>

            <ChainInfo chainName="osmosis" />
          </>
        )}
      </main>
    </div>
  );
}