import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ChainSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChainSearch({ value, onChange }: ChainSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search chains..."
        className="pl-9"
      />
    </div>
  );
}