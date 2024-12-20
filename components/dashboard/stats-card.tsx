import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeplr } from "@/hooks/use-keplr";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useTaxCalculation } from "@/hooks/use-tax-calculation";

interface StatsCardProps {
  title: string;
  icon: React.ReactNode;
  type: 'available' | 'staked' | 'converted' | 'unclaimed' | 'tax';
  description?: string;
  value?: number;
  isLoading?: boolean;
  tokenSymbol?: string;
  chainName?: string;
}

export function StatsCard({ 
  title, 
  icon, 
  type, 
  description, 
  value,
  isLoading,
  tokenSymbol = "OSMO",
  chainName = 'osmosis'
}: StatsCardProps) {
  const { 
    balance,
    stakedBalance,
    unclaimedRewards,
    status
  } = useKeplr(chainName);
  const { formatUsdValue, fetchPrice } = useTokenPrice(chainName);
  const { calculateTaxObligation } = useTaxCalculation();
  const [usdValue, setUsdValue] = React.useState<string>("$0.00");
  const [totalValue, setTotalValue] = React.useState<number>(0);

  React.useEffect(() => {
    const updateValue = async () => {
      if (type === 'tax') {
        setUsdValue(value ? `$${value.toFixed(2)}` : "$0.00");
        return;
      }

      try {
        let amount = "0";
        switch (type) {
          case 'available':
            amount = balance;
            break;
          case 'staked':
            amount = stakedBalance;
            break;
          case 'unclaimed':
            amount = unclaimedRewards;
            break;
          case 'converted': {
            // Calculate total value in USD
            const price = await fetchPrice(chainName);
            const total = (
              Number(balance) +
              Number(stakedBalance) +
              Number(unclaimedRewards)
            ) * price;
            setTotalValue(total);
            setUsdValue(`$${total.toFixed(2)}`);
            return;
          }
        }

        const formattedValue = await formatUsdValue(amount);
        setUsdValue(formattedValue);

        if (type === 'unclaimed') {
          const taxObligation = calculateTaxObligation(formattedValue);
          window.dispatchEvent(new CustomEvent('taxObligationChanged', { 
            detail: { taxObligation } 
          }));
        }
      } catch (err) {
        console.error("Error formatting USD value:", err);
        setUsdValue("$0.00");
      }
    };

    updateValue();
  }, [type, balance, stakedBalance, unclaimedRewards, formatUsdValue, value, calculateTaxObligation, chainName, fetchPrice]);

  const isWalletConnected = status === 'Connected';

  const getDisplayValue = () => {
    if (!isWalletConnected) return "--";

    if (type === 'converted') {
      return (
        <div>
          <div>{usdValue}</div>
          <div className="text-sm text-muted-foreground">
            Total {tokenSymbol} Value
          </div>
        </div>
      );
    }

    if (type === 'tax') {
      return usdValue;
    }

    switch (type) {
      case 'available':
        return (
          <div>
            <div>{balance} {tokenSymbol}</div>
            <div className="text-sm text-muted-foreground">{usdValue}</div>
          </div>
        );
      case 'staked':
        return (
          <div>
            <div>{stakedBalance} {tokenSymbol}</div>
            <div className="text-sm text-muted-foreground">{usdValue}</div>
          </div>
        );
      case 'unclaimed':
        const estimatedTax = calculateTaxObligation(usdValue);
        return (
          <div className="space-y-1">
            <div>{unclaimedRewards} {tokenSymbol}</div>
            <div className="text-sm text-muted-foreground">{usdValue}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {description}: ${estimatedTax.toFixed(2)}
            </div>
          </div>
        );
      default:
        return "--";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-[100px]" />
            {description && <Skeleton className="h-4 w-[200px]" />}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold">{getDisplayValue()}</div>
            {description && type !== 'unclaimed' && (
              <p className="text-xs text-muted-foreground">
                {!isWalletConnected ? "Connect wallet to view" : description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}