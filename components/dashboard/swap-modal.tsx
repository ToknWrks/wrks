import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSkipSwap } from "@/hooks/use-skip-swap";
import { TokenSelect } from "./token-select";
import { ChainSelect } from "./chain-select";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useKeplr } from "@/hooks/use-keplr";
import { useSwapSettings } from "@/hooks/use-swap-settings";

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  chainName?: string;
}

const DEFAULT_TOKENS = [
  { 
    denom: 'uosmo', 
    symbol: 'OSMO', 
    name: 'Osmosis', 
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png' 
  },
  { 
    denom: 'noble-usdc', 
    symbol: 'USDC', 
    name: 'Noble USDC', 
    logo: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/usdc.png' 
  }
];

export function SwapModal({ open, onClose, chainName = 'osmosis' }: SwapModalProps) {
  const { balance, status } = useKeplr(chainName);
  const { settings } = useSwapSettings();
  const {
    fromToken,
    toToken,
    estimatedAmount,
    isLoading,
    isExecuting,
    error,
    getEstimate,
    executeSwap,
    switchTokens,
    setFromToken,
    setToToken,
    chainToken
  } = useSkipSwap(chainName);

  const [amount, setAmount] = useState("");
  const [fromChain, setFromChain] = useState(chainName === 'cosmoshub' ? 'cosmoshub-4' : `${chainName}-1`);
  const [toChain, setToChain] = useState("noble-1");

  // Calculate auto-amount only when needed
  const calculateAutoAmount = useCallback(() => {
    if (status === 'Connected' && balance && settings.autoSwapPercentage) {
      return (Number(balance) * settings.autoSwapPercentage / 100).toFixed(6);
    }
    return "";
  }, [status, balance, settings.autoSwapPercentage]);

  // Set initial amount only when modal opens
  useEffect(() => {
    if (open) {
      const autoAmount = calculateAutoAmount();
      setAmount(autoAmount);
      
      // Only get estimate if we have an amount
      if (autoAmount) {
        getEstimate(autoAmount);
      }
    }
  }, [open, calculateAutoAmount]);

  // Handle amount changes
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value) {
      getEstimate(value);
    }
  };

  // Update tokens list based on chain
  const availableTokens = DEFAULT_TOKENS.map(token => {
    if (token.denom === fromToken && chainToken) {
      return {
        ...token,
        denom: chainToken.denom,
        symbol: chainToken.symbol,
        name: chainToken.symbol
      };
    }
    return token;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Swap Tokens</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>From</Label>
              <ChainSelect
                value={fromChain}
                onValueChange={setFromChain}
                excludeChain={toChain}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
              <TokenSelect
                tokens={availableTokens}
                value={fromToken}
                onValueChange={setFromToken}
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={switchTokens}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>To</Label>
              <ChainSelect
                value={toChain}
                onValueChange={setToChain}
                excludeChain={fromChain}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={estimatedAmount}
                disabled
              />
              <TokenSelect
                tokens={availableTokens}
                value={toToken}
                onValueChange={setToToken}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={() => executeSwap(amount)}
            disabled={!amount || isLoading || isExecuting || !estimatedAmount || status !== 'Connected'}
          >
            {isExecuting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </span>
            ) : isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting estimate...
              </span>
            ) : status !== 'Connected' ? (
              'Connect Wallet'
            ) : !amount ? (
              'Enter amount'
            ) : (
              'Swap'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}