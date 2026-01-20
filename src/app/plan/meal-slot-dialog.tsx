"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setMealSlot, removeMealSlot } from "./actions";
import type { Recipe } from "@/db/schema";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
} as const;

interface MealSlotDialogProps {
  weeklyPlanId: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner";
  recipes: Recipe[];
  currentSlot?: {
    id: string;
    recipeId: string | null;
    servings: number;
    recipe: Recipe | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MealSlotDialog({
  weeklyPlanId,
  dayOfWeek,
  mealType,
  recipes,
  currentSlot,
  open,
  onOpenChange,
}: MealSlotDialogProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    currentSlot?.recipeId || ""
  );
  const [servings, setServings] = useState<number>(currentSlot?.servings || 4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  async function handleSave() {
    if (!selectedRecipeId) return;

    setIsSubmitting(true);
    try {
      await setMealSlot({
        weeklyPlanId,
        dayOfWeek,
        mealType,
        recipeId: selectedRecipeId,
        servings,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to set meal slot:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!currentSlot?.id) return;

    setIsRemoving(true);
    try {
      await removeMealSlot(currentSlot.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to remove meal slot:", error);
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {DAYS[dayOfWeek]} - {MEAL_LABELS[mealType]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Recipe</Label>
            <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipe" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recipes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recipes yet. Create some recipes first.
              </p>
            )}
          </div>

          {selectedRecipe && (
            <div className="space-y-2">
              <Label>Servings</Label>
              <Input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                Recipe default: {selectedRecipe.servings} servings
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {currentSlot?.id ? (
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving || isSubmitting}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedRecipeId || isSubmitting || isRemoving}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
