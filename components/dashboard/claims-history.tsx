import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useKeplr } from "@/hooks/use-keplr";
import { useRewardsHistory } from "@/hooks/use-rewards-history";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useTokenPrice } from "@/hooks/use-token-price";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RewardEvent {
  amount: string;
  timestamp: string;
  validatorAddress: string;
  validatorName?: string;
  usdValue?: string;
  type: 'claimed' | 'unclaimed';
  txHash?: string;
}

interface ClaimsHistoryProps {
  onTotalClaimedChange?: (value: number) => void;
  chainName?: string;
}

const LoadingState = () => (
  <div className="space-y-4">
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>Loading rewards history...</AlertDescription>
    </Alert>
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

const EmptyState = () => (
  <Alert>
    <InfoIcon className="h-4 w-4" />
    <AlertDescription>No rewards found</AlertDescription>
  </Alert>
);

export function ClaimsHistory({ onTotalClaimedChange, chainName = 'osmosis' }: ClaimsHistoryProps) {
  const { address, status } = useKeplr(chainName);
  const { fetchRewardsHistory, isLoading, error } = useRewardsHistory(chainName);
  const { formatUsdValue } = useTokenPrice(chainName);
  const [rewards, setRewards] = useState<RewardEvent[]>([]);

  const tokenSymbol = chainName === 'cosmoshub' ? 'ATOM' : 'OSMO';

  useEffect(() => {
    let mounted = true;

    const loadRewardsHistory = async () => {
      if (!address || status !== 'Connected') return;

      try {
        const rewardsHistory = await fetchRewardsHistory(address);
        
        if (!mounted) return;

        // Add USD values
        const rewardsWithValue = await Promise.all(
          rewardsHistory.map(async (reward) => ({
            ...reward,
            usdValue: await formatUsdValue(reward.amount)
          }))
        );

        if (!mounted) return;

        setRewards(rewardsWithValue);
        
        if (onTotalClaimedChange) {
          const total = rewardsWithValue
            .filter(reward => reward.type === 'claimed')
            .reduce((sum, reward) => {
              const value = parseFloat(reward.usdValue?.replace(/[^0-9.-]+/g, '') || '0');
              return sum + (isNaN(value) ? 0 : value);
            }, 0);
          onTotalClaimedChange(total);
        }
      } catch (err) {
        console.error("Failed to load rewards history:", err);
      }
    };

    loadRewardsHistory();

    return () => {
      mounted = false;
    };
  }, [address, status, fetchRewardsHistory, formatUsdValue, onTotalClaimedChange]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading rewards: {error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (rewards.length === 0) {
    return <EmptyState />;
  }

  const unclaimedRewards = rewards.filter(r => r.type === 'unclaimed');
  const claimedRewards = rewards.filter(r => r.type === 'claimed');

  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Showing rewards history for the past 3 months
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="unclaimed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unclaimed">
            Unclaimed ({unclaimedRewards.length})
          </TabsTrigger>
          <TabsTrigger value="claimed">
            Claimed ({claimedRewards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unclaimed">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Validator</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unclaimedRewards.map((reward, index) => (
                  <TableRow key={`${reward.validatorAddress}-${index}`}>
                    <TableCell>{reward.validatorName || "Unknown Validator"}</TableCell>
                    <TableCell className="text-right">
                      {reward.amount} {tokenSymbol}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {reward.usdValue}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="ml-auto">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="claimed">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Validator</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimedRewards.map((reward, index) => (
                  <TableRow key={`${reward.validatorAddress}-${index}`}>
                    <TableCell>
                      {format(new Date(reward.timestamp), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{reward.validatorName || "Unknown Validator"}</TableCell>
                    <TableCell className="text-right">
                      {reward.amount} {tokenSymbol}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {reward.usdValue}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="ml-auto">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Claimed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}