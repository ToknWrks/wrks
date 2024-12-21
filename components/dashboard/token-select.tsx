"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CHAINS } from "@/lib/constants/chains";
import { NOBLE_USDC } from "@/lib/constants/tokens";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  chainName: string;
  isLoading?: boolean;
}

export function TokenSelect({ value, onValueChange, chainName, isLoading }: TokenSelectProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-[120px]" />;
  }

  // Get token info based on chain
  const getTokenInfo = () => {
    if (chainName === 'noble') {
      return [NOBLE_USDC];
    }
    const chain = SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS];
    if (!chain) return [];
    return [{
      denom: chain.denom,
      symbol: chain.symbol,
      name: chain.name,
      logo: chain.icon
    }];
  };

  const tokens = getTokenInfo();
  const selectedToken = tokens.find(t => t.denom === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            {selectedToken?.logo && (
              <div className="relative w-4 h-4">
                <Image
                  src={selectedToken.logo}
                  alt={selectedToken.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            {selectedToken?.symbol}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem
            key={token.denom}
            value={token.denom}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              {token.logo && (
                <div className="relative w-4 h-4">
                  <Image
                    src={token.logo}
                    alt={token.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span>{token.symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}