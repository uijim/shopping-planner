"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Share2, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ShoppingListItem, CustomShoppingItemData } from "../actions";
import type { SavedItemData } from "@/app/saved-items/actions";
import {
  addCustomItem,
  removeCustomItem,
  toggleCustomItemChecked,
  clearAllCustomItems,
} from "../actions";
import { AddFromSavedModal } from "./add-from-saved-modal";

const addItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.string().optional(),
  unit: z.string().optional(),
});

type AddItemFormValues = z.infer<typeof addItemSchema>;

interface ShoppingListContentProps {
  items: ShoppingListItem[];
  customItems: CustomShoppingItemData[];
  savedItems: SavedItemData[];
  weekStartDate: string;
  weeklyPlanId: string;
}

export function ShoppingListContent({
  items,
  customItems,
  savedItems,
  weekStartDate,
  weeklyPlanId,
}: ShoppingListContentProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      name: "",
      quantity: "",
      unit: "",
    },
  });

  // Initialize checked state for custom items
  const customCheckedState = new Set(
    customItems.filter((item) => item.isChecked).map((item) => `custom-${item.id}`)
  );

  // Combine recipe items with custom items
  type CombinedItem =
    | { type: "recipe"; item: ShoppingListItem; sortName: string }
    | { type: "custom"; item: CustomShoppingItemData; sortName: string };

  const allItems: CombinedItem[] = [
    ...items.map((item) => ({
      type: "recipe" as const,
      item,
      sortName: item.productName.toLowerCase(),
    })),
    ...customItems.map((item) => ({
      type: "custom" as const,
      item,
      sortName: item.name.toLowerCase(),
    })),
  ];

  // Sort alphabetically by name
  const sortedItems = allItems.sort((a, b) => a.sortName.localeCompare(b.sortName));
  const totalItemCount = items.length + customItems.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleItem = (itemKey: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const handleToggleCustomItem = (itemId: string, currentState: boolean) => {
    startTransition(async () => {
      await toggleCustomItemChecked(itemId, !currentState);
    });
  };

  const handleRemoveCustomItem = (itemId: string) => {
    startTransition(async () => {
      await removeCustomItem(itemId);
    });
  };

  const handleClearAllCustomItems = () => {
    startTransition(async () => {
      await clearAllCustomItems(weeklyPlanId);
    });
  };

  const formatQuantity = (item: ShoppingListItem) => {
    const qty = item.displayQuantity;
    const unit = item.baseUnit;

    // Format based on base unit
    if (unit === "g") {
      if (qty >= 1000) {
        return `${(qty / 1000).toFixed(1)} kg`;
      }
      return `${Math.round(qty)} g`;
    }
    if (unit === "ml") {
      if (qty >= 1000) {
        return `${(qty / 1000).toFixed(1)} L`;
      }
      return `${Math.round(qty)} ml`;
    }
    // unit type
    return qty === 1 ? "1" : qty.toString();
  };

  const formatCustomQuantity = (item: CustomShoppingItemData) => {
    if (!item.quantity) return "";
    if (item.unit) {
      return `${item.quantity} ${item.unit}`;
    }
    return item.quantity.toString();
  };

  const formatListForSharing = () => {
    const lines: string[] = [];

    for (const combinedItem of sortedItems) {
      if (combinedItem.type === "recipe") {
        const item = combinedItem.item;
        const qty = formatQuantity(item);
        lines.push(`• ${item.productName} (${qty})`);
      } else {
        const item = combinedItem.item;
        const qty = formatCustomQuantity(item);
        if (qty) {
          lines.push(`• ${item.name} (${qty})`);
        } else {
          lines.push(`• ${item.name}`);
        }
      }
    }

    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = formatListForSharing();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shopping List - Week of ${formatDate(weekStartDate)}`,
          text,
        });
      } catch (error) {
        // User cancelled or share failed - ignore AbortError
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert("Shopping list copied to clipboard!");
      } catch (error) {
        console.error("Clipboard write failed:", error);
        alert("Failed to copy to clipboard");
      }
    }
  };

  const onSubmit = (values: AddItemFormValues) => {
    startTransition(async () => {
      await addCustomItem({
        weeklyPlanId,
        name: values.name,
        quantity: values.quantity ? parseFloat(values.quantity) : undefined,
        unit: values.unit || undefined,
      });
      form.reset();
      setDialogOpen(false);
    });
  };

  return (
    <>
      <PageHeader>
        <div className="flex items-center gap-4">
          <Link href="/" className="screen-only">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Shopping List</h1>
            <p className="text-muted-foreground">
              Week of {formatDate(weekStartDate)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={totalItemCount === 0}
            className="md:size-default"
          >
            <Share2 className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Share</span>
          </Button>
          {customItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllCustomItems}
              disabled={isPending}
              className="md:size-default"
            >
              <Trash2 className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">{isPending ? "Clearing..." : "Clear custom"}</span>
            </Button>
          )}
          <AddFromSavedModal savedItems={savedItems} weeklyPlanId={weeklyPlanId} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="md:size-default">
                <Plus className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Add Item</span>
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bread" autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g., 2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., loaves" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Adding..." : "Add Item"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {totalItemCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground screen-only" />
            <p className="text-lg font-medium">No items in your shopping list</p>
            <p className="text-muted-foreground">
              Add meals to your weekly plan or add custom items.
            </p>
            <div className="mt-4 flex gap-2 screen-only">
              <Link href="/">
                <Button variant="outline">Go to Meal Planner</Button>
              </Link>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground screen-only">
            {totalItemCount} item{totalItemCount !== 1 ? "s" : ""}
          </p>

          <Card className="print-no-chrome">
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {sortedItems.map((combinedItem) => {
                  if (combinedItem.type === "recipe") {
                    const item = combinedItem.item;
                    const itemKey = `${item.productId}-${item.baseUnit}`;
                    const isChecked = checkedItems.has(itemKey);

                    return (
                      <li key={itemKey} className="flex items-center gap-3">
                        <Checkbox
                          id={itemKey}
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(itemKey)}
                        />
                        <label
                          htmlFor={itemKey}
                          className={`flex-1 cursor-pointer ${
                            isChecked
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          <span className="font-medium">{item.productName}</span>
                          <span className="ml-2 text-muted-foreground">
                            {formatQuantity(item)}
                          </span>
                        </label>
                      </li>
                    );
                  } else {
                    const item = combinedItem.item;
                    const itemKey = `custom-${item.id}`;
                    const isChecked =
                      item.isChecked || customCheckedState.has(itemKey);

                    return (
                      <li key={itemKey} className="flex items-center gap-3">
                        <Checkbox
                          id={itemKey}
                          checked={isChecked}
                          onCheckedChange={() =>
                            handleToggleCustomItem(item.id, item.isChecked)
                          }
                          disabled={isPending}
                        />
                        <label
                          htmlFor={itemKey}
                          className={`flex-1 cursor-pointer ${
                            isChecked
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          <span className="font-medium">{item.name}</span>
                          {formatCustomQuantity(item) && (
                            <span className="ml-2 text-muted-foreground">
                              {formatCustomQuantity(item)}
                            </span>
                          )}
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive screen-only"
                          onClick={() => handleRemoveCustomItem(item.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    );
                  }
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
