"use client";

import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ClaimEventProps {
  amount: string;
  timestamp: string;
  validatorName: string;
  usdValue: string;
  txHash: string;
  chainName: string;
}

export function ClaimEvent({ amount, timestamp, validatorName, usdValue, txHash, chainName }: ClaimEventProps) {
  const explorerUrl = chainName === 'osmosis' 
    ? `https://www.mintscan.io/osmosis/tx/${txHash}`
    : `https://www.mintscan.io/${chainName}/tx/${txHash}`;

  const tokenSymbol = chainName === 'osmosis' ? 'OSMO' : chainName.toUpperCase();
  const formattedAmount = formatNumber(Number(amount) / 1_000_000, 2);

  return (
    <div className="flex justify-between items-center p-4 border rounded-lg">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{validatorName}</span>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </div>
        <span className="text-sm text-muted-foreground">{timestamp}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <Badge variant="outline">
            {formattedAmount} {tokenSymbol}
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">${usdValue}</div>
        </div>
        <Link 
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}