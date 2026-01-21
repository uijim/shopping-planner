"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { AddSavedItemDialog } from "./add-saved-item-dialog";
import { EditSavedItemDialog } from "./edit-saved-item-dialog";
import { deleteSavedItem } from "./actions";
import type { SavedItemData } from "./actions";

interface SavedItemsListProps {
  items: SavedItemData[];
}

export function SavedItemsList({ items }: SavedItemsListProps) {
  const [editItem, setEditItem] = useState<SavedItemData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort items alphabetically by name
  const filteredItems = items
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleEdit = (item: SavedItemData) => {
    setEditItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (itemId: string) => {
    startTransition(async () => {
      await deleteSavedItem(itemId);
    });
  };

  const formatQuantity = (item: SavedItemData) => {
    if (!item.quantity) return "";
    if (item.unit) {
      return `${item.quantity} ${item.unit}`;
    }
    return item.quantity.toString();
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">Saved Items</h1>
          <p className="text-muted-foreground">
            Items you frequently add to your shopping list
          </p>
        </div>
        <AddSavedItemDialog />
      </PageHeader>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No saved items yet</p>
            <p className="text-muted-foreground">
              Add items you frequently buy to quickly add them to your shopping list.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <p className="text-muted-foreground">
            {filteredItems.length} of {items.length} item{items.length !== 1 ? "s" : ""}
          </p>

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No items found matching &quot;{searchQuery}&quot;
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {filteredItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <span className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        {formatQuantity(item) && (
                          <span className="ml-2 text-muted-foreground">
                            {formatQuantity(item)}
                          </span>
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(item)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <EditSavedItemDialog
        item={editItem}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
