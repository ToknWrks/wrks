"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useKeplr } from "@/hooks/use-keplr";
import { useClaimRewards } from "@/hooks/use-claim-rewards";
import { Skeleton } from "@/components/ui/skeleton";
import { CoinsIcon } from "lucide-react";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export function UnclaimedRewardsCard() {
  const { unclaimedRewards, status, isLoading, address, delegations } = useKeplr();
  const { claimRewards, isLoading: isClaimLoading } = useClaimRewards();
  const { formatUsdValue } = useTokenPrice('osmosis-1');
  const [taxRate, setTaxRate] = useState(30);
  const [usdValue, setUsdValue] = useState("$0.00");
  const [estimatedTax, setEstimatedTax] = useState("$0.00");
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem("osmosis_dashboard_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTaxRate(Number(settings.taxRate));
    }

    const handleSettingsChange = (event: CustomEvent<{ taxRate: string }>) => {
      setTaxRate(Number(event.detail.taxRate));
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const updateValues = async () => {
      const value = await formatUsdValue(unclaimedRewards);
      setUsdValue(value);
      
      const numericValue = Number(value.replace(/[^0-9.-]+/g, ""));
      const taxAmount = (numericValue * taxRate) / 100;
      setEstimatedTax(`$${taxAmount.toFixed(2)}`);
    };

    updateValues();
  }, [unclaimedRewards, taxRate, formatUsdValue]);

  const handleClaimRewards = async () => {
    if (!address || !delegations.length) {
      toast({
        title: "Error",
        description: "No delegations found to claim rewards from",
        variant: "destructive",
      });
      return;
    }

    const validatorAddresses = delegations.map(d => d.delegation.validator_address);
    
    const success = await claimRewards({
      address,
      validatorAddresses,
    });

    if (success) {
      // Refresh the page data
      window.location.reload();
    }
  };

  if (status !== 'Connected') {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unclaimed Rewards</CardTitle>
          <CoinsIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view unclaimed rewards
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unclaimed Rewards</CardTitle>
          <CoinsIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Unclaimed Rewards</CardTitle>
        <CoinsIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{unclaimedRewards} OSMO</div>
          <div className="text-sm text-muted-foreground">{usdValue}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Estimated Tax: {estimatedTax}
            </p>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleClaimRewards}
              disabled={Number(unclaimedRewards) === 0 || isClaimLoading}
              className="h-8"
            >
              {isClaimLoading ? 'Claiming...' : Number(unclaimedRewards) === 0 ? 'No Rewards' : 'Claim'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}