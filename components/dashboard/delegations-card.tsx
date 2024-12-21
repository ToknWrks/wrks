import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DelegationList } from "./delegations/delegation-list";
import { ClaimsList } from "./claims/claims-list";
import { useKeplr } from "@/hooks/use-keplr";

interface DelegationsCardProps {
  chainName?: string;
  onTotalClaimedChange?: (value: number) => void;
}

export function DelegationsCard({ chainName = 'osmosis', onTotalClaimedChange }: DelegationsCardProps) {
  const { address } = useKeplr(chainName);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Delegations & History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="delegations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="delegations">Delegations</TabsTrigger>
            <TabsTrigger value="claims">Claims History</TabsTrigger>
          </TabsList>

          <TabsContent value="delegations" className="mt-4">
            <DelegationList chainName={chainName} />
          </TabsContent>

          <TabsContent value="claims" className="mt-4">
            <ClaimsList chainName={chainName} address={address} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}