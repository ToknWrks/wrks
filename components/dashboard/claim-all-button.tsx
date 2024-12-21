"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RewardsModal } from "./rewards-modal";

interface ClaimAllButtonProps {
  disabled?: boolean;
}

export function ClaimAllButton({ disabled }: ClaimAllButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowModal(true)}
        disabled={disabled}
        className="h-9"
      >
        Claim All
      </Button>

      <RewardsModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}