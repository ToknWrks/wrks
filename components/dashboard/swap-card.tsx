"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useOsmosisChain } from "@/hooks/use-osmosis-chain";
import { ArrowDownUp } from "lucide-react";

export function SwapCard() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const { status, address } = useOsmosisChain();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwap = async () => {
    if (!fromAmount || !address) return;
    
    setIsLoading(true);
    try {
      // TODO: Implement swap functionality using CosmJS
      console.log("Swap initiated:", {
        from: "OSMO",
        to: "USDC",
        amount: fromAmount,
        address
      });
    } catch (error) {
      console.error("Swap error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Simple mock calculation - in production this would use actual pool data
    const estimatedAmount = value ? (parseFloat(value) * 0.95).toFixed(2) : "";
    setToAmount(estimatedAmount);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle>Swap</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              disabled={status !== 'Connected'}
            />
            <div className="text-sm text-muted-foreground">OSMO</div>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="absolute bg-background px-2">
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full border-t" />
          </div>

          <div className="space-y-2">
            <Label>To (Estimated)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount}
              disabled
            />
            <div className="text-sm text-muted-foreground">USDC</div>
          </div>

          <Button 
            className="w-full" 
            disabled={status !== 'Connected' || !fromAmount || isLoading}
            onClick={handleSwap}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Swapping...
              </span>
            ) : status !== 'Connected' ? (
              'Connect Wallet to Swap'
            ) : !fromAmount ? (
              'Enter an amount'
            ) : (
              'Swap'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}