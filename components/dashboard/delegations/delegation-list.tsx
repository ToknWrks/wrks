"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKeplr } from "@/hooks/use-keplr";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatUSD } from "@/lib/utils";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useClaimRewards } from "@/hooks/use-claim-rewards";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DelegationListProps {
  chainName?: string;
}

export function DelegationList({ chainName = 'osmosis' }: DelegationListProps) {
  const { delegations, isLoading, unclaimedRewards, address } = useKeplr(chainName);
  const { formatUsdValue, fetchPrice } = useTokenPrice(chainName);
  const { claimRewards, isLoading: isClaimLoading } = useClaimRewards();

  const formatDelegationAmount = (amount: string) => {
    const osmoAmount = Number(amount) / 1_000_000;
    return formatNumber(osmoAmount, 6);
  };

  const handleClaimRewards = async () => {
    if (!address || !delegations.length) return;
    
    const validatorAddresses = delegations.map(d => d.delegation.validator_address);
    await claimRewards({
      address,
      validatorAddresses,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  if (!delegations.length) {
    return (
      <div className="text-center text-muted-foreground">
        No active delegations found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {delegations.map((delegation, index) => (
        <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
          <span className="font-medium">{delegation.validator_name}</span>
          <Badge variant="outline">
            {formatDelegationAmount(delegation.balance.amount)} {chainName === 'osmosis' ? 'OSMO' : chainName.toUpperCase()}
          </Badge>
        </div>
      ))}

      <Separator className="my-4" />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Available to Claim</span>
          <div className="text-right">
            <div className="font-medium">
              {formatNumber(Number(unclaimedRewards), 2)} {chainName === 'osmosis' ? 'OSMO' : chainName.toUpperCase()}
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleClaimRewards}
          disabled={Number(unclaimedRewards) === 0 || isClaimLoading}
        >
          {isClaimLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Claiming...
            </>
          ) : (
            `Claim ${chainName === 'osmosis' ? 'OSMO' : chainName.toUpperCase()}`
          )}
        </Button>
      </div>
    </div>
  );
}