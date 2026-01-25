"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={disabled || isClearing}>
          <Trash2 className="mr-1 h-4 w-4" />
          {isClearing ? "Clearing..." : "Clear all"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all meals?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all meals from your weekly plan and clear any custom
            items from your shopping list. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleClearAll}>
            Clear all
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
