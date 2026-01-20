"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import type { ShoppingListItem } from "../actions";

interface ShoppingListContentProps {
  items: ShoppingListItem[];
  weekStartDate: string;
}

export function ShoppingListContent({
  items,
  weekStartDate,
}: ShoppingListContentProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Group items by category
  const itemsByCategory = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ShoppingListItem[]>
  );

  const categories = Object.keys(itemsByCategory).sort();

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

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/plan">
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

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No items in your shopping list</p>
            <p className="text-muted-foreground">
              Add meals to your weekly plan to generate a shopping list.
            </p>
            <Link href="/plan" className="mt-4">
              <Button>Go to Meal Planner</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} across{" "}
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </p>

          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {itemsByCategory[category].map((item) => {
                    const itemKey = `${item.productId}-${item.baseUnit}`;
                    const isChecked = checkedItems.has(itemKey);

                    return (
                      <li
                        key={itemKey}
                        className="flex items-center gap-3"
                      >
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
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
