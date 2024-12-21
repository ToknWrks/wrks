"use client";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChainSearch } from "@/components/dashboard/chain-search";
import { useChainSettings } from "@/hooks/use-chain-settings";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useKeplr } from "@/hooks/use-keplr";
import { useMultiChainBalances } from "@/hooks/use-multi-chain-balances";
import { useState, useMemo } from "react";
import Link from "next/link";
import { SUPPORTED_CHAINS } from '@/lib/constants/chains';

export default function ChainSettingsPage() {
  const { toggleChain, toggleAll, isChainEnabled } = useChainSettings();
  const { status } = useKeplr();
  const { balances } = useMultiChainBalances(status === 'Connected' ? undefined : undefined);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort chains
  const filteredChains = useMemo(() => {
    return Object.entries(SUPPORTED_CHAINS)
      .filter(([_, chain]) => {
        const matchesSearch = chain.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort(([aKey, aChain], [bKey, bChain]) => {
        // Sort chains with balance first, then alphabetically
        const aHasBalance = Boolean(balances[aKey]);
        const bHasBalance = Boolean(balances[bKey]);
        if (aHasBalance && !bHasBalance) return -1;
        if (!aHasBalance && bHasBalance) return 1;
        return aChain.name.localeCompare(bChain.name);
      });
  }, [searchQuery, balances]);

  const allChainNames = filteredChains.map(([key]) => key);
  const allEnabled = allChainNames.every(chain => isChainEnabled(chain));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Chain Settings</h1>
          <Link 
            href="/chains"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View All Chains
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Enabled Chains</CardTitle>
            <div className="flex items-center gap-4">
              <ChainSearch value={searchQuery} onChange={setSearchQuery} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAll(allChainNames)}
              >
                {allEnabled ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChains.map(([key, chain]) => {
                const chainHasBalance = Boolean(balances[key]);
                
                return (
                  <div
                    key={key}
                    className={`flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors border ${
                      chainHasBalance ? 'bg-muted/30' : ''
                    }`}
                  >
                    <Checkbox
                      id={key}
                      checked={isChainEnabled(key)}
                      onCheckedChange={() => toggleChain(key)}
                    />
                    {chain.icon && (
                      <div className="h-8 w-8 relative flex-shrink-0">
                        <Image
                          src={chain.icon}
                          alt={chain.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer truncate"
                      >
                        {chain.name}
                      </label>
                      {chainHasBalance && (
                        <span className="text-xs text-muted-foreground mt-1">
                          Has balance
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}