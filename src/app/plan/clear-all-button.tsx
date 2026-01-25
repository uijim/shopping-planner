"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { clearAllMeals } from "./actions";

interface ClearAllButtonProps {
  weeklyPlanId: string;
  disabled?: boolean;
}

export function ClearAllButton({ weeklyPlanId, disabled }: ClearAllButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleClearAll() {
    setIsClearing(true);
    try {
      await clearAllMeals(weeklyPlanId);
      setOpen(false);
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled || isClearing}>
          <Trash2 className="mr-1 h-4 w-4" />
          {isClearing ? "Clearing..." : "Clear all"}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Clear all meals?</DialogTitle>
          <DialogDescription>
            This will remove all meals from your weekly plan and clear any custom
            items from your shopping list. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleClearAll} disabled={isClearing}>
            {isClearing ? "Clearing..." : "Clear all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
