"use client";

import { Wallet, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "./settings-modal";
import { SwapModal } from "./swap-modal";
import { WalletModal } from "./wallet-modal";
import { useState } from "react";
import { useKeplr } from "@/hooks/use-keplr";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { NETWORKS } from "@/config/networks";
import { ClaimAllButton } from "./claim-all-button";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  chainName?: string;
}

export function Header({ chainName = 'osmosis' }: HeaderProps) {
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { status, isLoading, address, disconnect, unclaimedRewards, connect } = useKeplr(chainName);
  const [isOpen, setIsOpen] = useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
  };

  const isWalletConnected = status === 'Connected';
  const isWalletConnecting = isLoading;

  const handleWalletClick = async () => {
    if (isWalletConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (err) {
        console.error('Failed to connect wallet:', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <SheetHeader>
              <SheetTitle className="text-left">ToknWrks</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {NETWORKS.map((network) => (
                <Link
                  key={network.href}
                  href={network.href}
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src={network.icon}
                      alt={network.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {network.name}
                </Link>
              ))}
              <Separator />
              <Link
                href="/chains"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-5 h-5 relative flex-shrink-0">
                  <Image
                    src="/chain-logos/all-chains.svg"
                    alt="All Chains"
                    fill
                    className="object-contain"
                  />
                </div>
                All Chains
              </Link>
              <Link
                href="/settings/chains"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-5 w-5" />
                Chain Settings
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">ToknWrks</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowSwapModal(true)}
            >
              Swap
            </Button>

            {isWalletConnected && Number(unclaimedRewards) > 0 && (
              <ClaimAllButton />
            )}

            <Button 
              variant="outline" 
              onClick={handleWalletClick}
              disabled={isWalletConnecting}
            >
              {isWalletConnecting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4" />
                  {isWalletConnected && address ? formatAddress(address) : 'Connect Wallet'}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Settings</span>
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </div>

      <SwapModal open={showSwapModal} onClose={() => setShowSwapModal(false)} />
      <WalletModal open={showWalletModal} onClose={() => setShowWalletModal(false)} chainName={chainName} />
      <SettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
    </header>
  );
}