"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useKeplr } from "@/hooks/use-keplr";
import { useTheme } from "next-themes";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  chainName?: string;
}

export function WalletModal({ open, onClose, chainName = 'osmosis' }: WalletModalProps) {
  const { connect, isLoading, error } = useKeplr(chainName);
  const { resolvedTheme } = useTheme();

  const handleConnect = async () => {
    try {
      await connect();
      onClose();
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleConnect}
            disabled={isLoading}
          >
            <div className="flex items-center w-full">
              <div className="w-6 h-6 relative flex items-center justify-center">
                <Image
                  src={resolvedTheme === 'light' ? '/keplr-light-mode.png' : '/keplr-logo.png'}
                  alt="Keplr"
                  width={24}
                  height={24}
                  priority
                  className="object-contain"
                />
              </div>
              <span className="ml-2">Keplr Wallet</span>
              {isLoading && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin" />
              )}
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}