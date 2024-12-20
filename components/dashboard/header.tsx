import { MoonStar, Sun, Wallet, Menu, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "./settings-modal";
import { SwapModal } from "./swap-modal";
import { WalletModal } from "./wallet-modal";
import { useState } from "react";
import { useKeplr } from "@/hooks/use-keplr";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { NETWORKS } from "@/config/networks";

interface HeaderProps {
  chainName?: string;
}

export function Header({ chainName = 'osmosis' }: HeaderProps) {
  const { setTheme } = useTheme();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { status, isLoading, address, disconnect, unclaimedRewards } = useKeplr(chainName);
  const [isOpen, setIsOpen] = useState(false);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
  };

  const isWalletConnected = status === 'Connected';
  const isWalletConnecting = isLoading;

  const handleWalletClick = () => {
    if (isWalletConnected) {
      disconnect();
    } else {
      setShowWalletModal(true);
    }
  };

  const handleClaimRewards = async () => {
    if (!isWalletConnected || !unclaimedRewards || Number(unclaimedRewards) === 0) return;

    setIsClaimingRewards(true);
    try {
      // TODO: Implement claim rewards functionality
      console.log("Claiming rewards...");
    } catch (err) {
      console.error("Error claiming rewards:", err);
    } finally {
      setIsClaimingRewards(false);
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
            <span className="font-bold">
              ToknWrks
            </span>
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
              <Button
                variant="outline"
                onClick={handleClaimRewards}
                disabled={isClaimingRewards}
              >
                {isClaimingRewards ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </span>
                ) : (
                  'Claim Rewards'
                )}
              </Button>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonStar className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <SwapModal open={showSwapModal} onClose={() => setShowSwapModal(false)} />
      <WalletModal open={showWalletModal} onClose={() => setShowWalletModal(false)} chainName={chainName} />
      <SettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
    </header>
  );
}