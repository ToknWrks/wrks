"use client";

import { SUPPORTED_CHAINS } from "@/lib/constants/chains";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface RewardsListProps {
  balances: Record<string, any>;
  onClaimRewards: (chainName: string) => Promise<void>;
  claimingChain: string | null;
}

export function RewardsList({ balances, onClaimRewards, claimingChain }: RewardsListProps) {
  // Filter and sort chains with rewards
  const chainsWithRewards = Object.entries(balances)
    .filter(([chainName]) => chainName in SUPPORTED_CHAINS)
    .filter(([_, balance]) => Number(balance.unclaimedRewards) > 0)
    .sort((a, b) => Number(b[1].usdValues.rewards) - Number(a[1].usdValues.rewards));

  if (chainsWithRewards.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          No unclaimed rewards found
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {chainsWithRewards.map(([chainName, balance]) => (
        <div key={chainName} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS]?.icon && (
              <div className="relative w-8 h-8">
                <Image
                  src={SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS].icon}
                  alt={SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS].name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <div className="font-medium">
                {SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS].name}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(Number(balance.unclaimedRewards), 6)}{' '}
                {SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS].symbol}
              </div>
              <div className="text-xs text-muted-foreground">
                ${(Number(balance.usdValues.rewards)).toFixed(2)}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={claimingChain === chainName}
            onClick={() => onClaimRewards(chainName)}
          >
            {claimingChain === chainName ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim'
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}