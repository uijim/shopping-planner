"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAllMeals } from "./actions";

interface ClearAllButtonProps {
  weeklyPlanId: string;
  disabled?: boolean;
}

export function ClearAllButton({ weeklyPlanId, disabled }: ClearAllButtonProps) {
  const [isClearing, setIsClearing] = useState(false);

  async function handleClearAll() {
    setIsClearing(true);
    try {
      await clearAllMeals(weeklyPlanId);
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClearAll}
      disabled={disabled || isClearing}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isClearing ? "Clearing..." : "Clear all"}
    </Button>
  );
}
