"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { bulkAddFromSaved } from "../actions";
import type { SavedItemData } from "@/app/saved-items/actions";

interface AddFromSavedModalProps {
  savedItems: SavedItemData[];
  weeklyPlanId: string;
}

export function AddFromSavedModal({
  savedItems,
  weeklyPlanId,
}: AddFromSavedModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Pre-select all items when opening the modal
      setSelectedIds(new Set(savedItems.map((item) => item.id)));
    }
    setOpen(isOpen);
  };

  // Sort items alphabetically
  const sortedItems = [...savedItems].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const handleToggle = (itemId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === savedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(savedItems.map((item) => item.id)));
    }
  };

  const handleAdd = () => {
    startTransition(async () => {
      await bulkAddFromSaved({
        weeklyPlanId,
        savedItemIds: Array.from(selectedIds),
      });
      setSelectedIds(new Set());
      setOpen(false);
    });
  };

  const formatQuantity = (item: SavedItemData) => {
    if (!item.quantity) return "";
    if (item.unit) {
      return `${item.quantity} ${item.unit}`;
    }
    return item.quantity.toString();
  };

  const allSelected = selectedIds.size === savedItems.length && savedItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={savedItems.length === 0} className="md:size-default">
          <Star className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">Add from Saved</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add from Saved Items</DialogTitle>
        </DialogHeader>

        {savedItems.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            No saved items yet. Go to Saved Items to add some.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between border-b pb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} of {savedItems.length} selected
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto py-2">
              <ul className="space-y-2">
                {sortedItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`saved-${item.id}`}
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => handleToggle(item.id)}
                    />
                    <label
                      htmlFor={`saved-${item.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{item.name}</span>
                      {formatQuantity(item) && (
                        <span className="ml-2 text-muted-foreground">
                          {formatQuantity(item)}
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={selectedIds.size === 0 || isPending}
              >
                {isPending
                  ? "Adding..."
                  : `Add ${selectedIds.size} Item${selectedIds.size !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
