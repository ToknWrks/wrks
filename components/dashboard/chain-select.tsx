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
import { chains } from 'chain-registry';

interface ChainSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  isLoading?: boolean;
  excludeChain?: string;
}

const SUPPORTED_CHAINS = [
  {
    id: "osmosis-1",
    name: "Osmosis",
    logo: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png"
  },
  {
    id: "cosmoshub-4",
    name: "Cosmos Hub",
    logo: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png"
  },
  {
    id: "noble-1",
    name: "Noble",
    logo: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/noble.png"
  }
];

export function ChainSelect({ value, onValueChange, isLoading, excludeChain }: ChainSelectProps) {
  const availableChains = SUPPORTED_CHAINS.filter(chain => chain.id !== excludeChain);

  if (isLoading) {
    return <Skeleton className="h-10 w-[140px]" />;
  }

  const selectedChain = SUPPORTED_CHAINS.find(c => c.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            {selectedChain?.logo && (
              <div className="relative w-4 h-4">
                <Image
                  src={selectedChain.logo}
                  alt={selectedChain.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            {selectedChain?.name}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableChains.map((chain) => (
          <SelectItem
            key={chain.id}
            value={chain.id}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              {chain.logo && (
                <div className="relative w-4 h-4">
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span>{chain.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}