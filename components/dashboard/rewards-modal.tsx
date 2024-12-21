"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface RewardsModalProps {
  open: boolean;
  onClose: () => void;
}

export function RewardsModal({ open, onClose }: RewardsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Rewards</DialogTitle>
        </DialogHeader>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Need help with Skip API here
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}