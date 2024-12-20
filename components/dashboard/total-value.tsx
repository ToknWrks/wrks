import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TotalValueProps {
  value: string;
  isLoading?: boolean;
}

export function TotalValue({ value, isLoading }: TotalValueProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-[200px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">${value}</span>
            <span className="text-sm text-muted-foreground">Total Value</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}