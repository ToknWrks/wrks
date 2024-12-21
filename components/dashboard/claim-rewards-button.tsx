import { Button } from "@/components/ui/button";
import { useClaimRewards } from "@/hooks/use-claim-rewards";
import { Loader2 } from "lucide-react";

interface ClaimRewardsButtonProps {
  chainName?: string;
  validatorAddresses: string[];
  onSuccess?: () => void;
  disabled?: boolean;
}

export function ClaimRewardsButton({
  chainName = 'osmosis',
  validatorAddresses,
  onSuccess,
  disabled
}: ClaimRewardsButtonProps) {
  const { claimRewards, isLoading } = useClaimRewards(chainName);

  const handleClick = async () => {
    const success = await claimRewards(validatorAddresses);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading || !validatorAddresses.length}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Claiming...
        </>
      ) : (
        'Claim Rewards'
      )}
    </Button>
  );
}