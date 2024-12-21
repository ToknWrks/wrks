"use client";

import { DelegationItem } from "./delegation-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";
import { useKeplr } from "@/hooks/use-keplr";

interface DelegationListProps {
  chainName?: string;
}

export function DelegationList({ chainName = 'osmosis' }: DelegationListProps) {
  const { delegations, isLoading, status } = useKeplr(chainName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!delegations.length) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          No active delegations found
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {delegations.map((delegation, index) => (
        <DelegationItem
          key={`${delegation.delegation.validator_address}-${index}`}
          chainName={chainName}
          delegation={delegation}
        />
      ))}
    </div>
  );
}