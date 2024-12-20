import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chains } from 'chain-registry';
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ChainInfoProps {
  chainName: string;
}

export function ChainInfo({ chainName }: ChainInfoProps) {
  const chain = chains.find((c) => c.chain_name === chainName);
  
  if (!chain) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {chain.pretty_name || chain.chain_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {chain.description}
        </div>
        {chain.website && (
          <Link
            href={chain.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            Visit Website
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}