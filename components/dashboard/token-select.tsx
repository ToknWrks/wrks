import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Token {
  denom: string;
  symbol: string;
  name: string;
  logo?: string;
  balance?: string;
}

interface TokenSelectProps {
  tokens: Token[];
  value: string;
  onValueChange: (value: string) => void;
  isLoading?: boolean;
}

export function TokenSelect({ tokens, value, onValueChange, isLoading }: TokenSelectProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-[120px]" />;
  }

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
              {token.balance && (
                <span className="text-xs text-muted-foreground">
                  ({token.balance})
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}