"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

const SWAP_TOKENS = [
  { value: "uusdc", label: "USDC", symbol: "USDC" },
  { value: "nbtc", label: "nBTC", symbol: "nBTC" },
  { value: "uosmo", label: "OSMO", symbol: "OSMO" },
  { value: "uatom", label: "ATOM", symbol: "ATOM" },
];

const STORAGE_KEY = "osmosis_dashboard_settings";

interface Settings {
  autoSwapPercentage: string;
  taxRate: string;
  selectedToken: string;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [autoSwapPercentage, setAutoSwapPercentage] = React.useState("50");
  const [taxRate, setTaxRate] = React.useState("30");
  const [selectedToken, setSelectedToken] = React.useState("uusdc");
  const { toast } = useToast();

  React.useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      const settings: Settings = JSON.parse(savedSettings);
      setAutoSwapPercentage(settings.autoSwapPercentage);
      setTaxRate(settings.taxRate);
      setSelectedToken(settings.selectedToken);
    }
  }, []);

  const handleSave = () => {
    const settings: Settings = {
      autoSwapPercentage,
      taxRate,
      selectedToken,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    const selectedTokenLabel = SWAP_TOKENS.find(t => t.value === selectedToken)?.label;
    toast({
      title: "Settings saved",
      description: `Settings updated: Auto-swap ${autoSwapPercentage}% to ${selectedTokenLabel}, Tax rate ${taxRate}%`,
    });
    onOpenChange(false);

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your auto-swap and tax preferences
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="autoSwap">Auto-swap percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="autoSwap"
                type="number"
                value={autoSwapPercentage}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)));
                  setAutoSwapPercentage(value.toString());
                }}
                className="flex-1"
                min="0"
                max="100"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Percentage of rewards to automatically swap when claiming
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Swap to token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {SWAP_TOKENS.map((token) => (
                  <SelectItem key={token.value} value={token.value}>
                    {token.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Token to receive when auto-swapping rewards
            </p>
          </div>

          <Separator className="my-2" />

          <div className="grid gap-2">
            <Label htmlFor="taxRate">Tax Rate</Label>
            <div className="flex items-center gap-2">
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)));
                  setTaxRate(value.toString());
                }}
                className="flex-1"
                min="0"
                max="100"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your tax rate for calculating estimated tax obligations
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}