import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useClaimRewards } from "@/hooks/use-claim-rewards";

interface DelegationItemProps {
  chainName: string;
  delegation: any;
  onClaimSuccess?: () => void;
}

export function DelegationItem({ chainName, delegation, onClaimSuccess }: DelegationItemProps) {
  const amount = formatNumber(Number(delegation.balance.amount) / 1_000_000, 6);
  const validatorName = delegation.validator?.name || "Unknown Validator";
  const validatorAddress = delegation.delegation.validator_address;
  const { claimRewards, isLoading } = useClaimRewards(chainName);

  const explorerUrl = chainName === 'osmosis' 
    ? `https://www.mintscan.io/osmosis/validators/${validatorAddress}`
    : `https://www.mintscan.io/${chainName}/validators/${validatorAddress}`;

  const handleClaim = async () => {
    const success = await claimRewards([validatorAddress]);
    if (success && onClaimSuccess) {
      onClaimSuccess();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{validatorName}</span>
          <Link 
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <Badge variant="outline" className="w-fit">
          {amount} {chainName === 'osmosis' ? 'OSMO' : chainName.toUpperCase()}
        </Badge>
        {delegation.validator?.commission && (
          <span className="text-xs text-muted-foreground">
            Commission: {(Number(delegation.validator.commission) * 100).toFixed(2)}%
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleClaim}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="ml-1">Claiming...</span>
          </>
        ) : (
          'Claim'
        )}
      </Button>
    </div>
  );
}