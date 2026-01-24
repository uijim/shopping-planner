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
import type { Recipe, MealSlotRecipe } from "@/db/schema";
import { X } from "lucide-react";

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

interface MealSlotRecipeWithRecipe extends MealSlotRecipe {
  recipe: Recipe;
}

interface MealSlotDialogProps {
  weeklyPlanId: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner";
  recipes: Recipe[];
  currentSlot?: {
    id: string;
    mealSlotRecipes: MealSlotRecipeWithRecipe[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedRecipe {
  recipeId: string;
  servings: number;
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
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipe[]>(
    () =>
      currentSlot?.mealSlotRecipes.map((msr) => ({
        recipeId: msr.recipeId,
        servings: msr.servings,
      })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Get recipe IDs that are already selected
  const selectedRecipeIds = new Set(selectedRecipes.map((r) => r.recipeId));

  // Available recipes (not already selected)
  const availableRecipes = recipes.filter((r) => !selectedRecipeIds.has(r.id));

  function handleAddRecipe(recipeId: string) {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    setSelectedRecipes((prev) => [
      ...prev,
      { recipeId, servings: recipe.servings },
    ]);
  }

  function handleRemoveRecipe(recipeId: string) {
    setSelectedRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
  }

  function handleServingsChange(recipeId: string, servings: number) {
    setSelectedRecipes((prev) =>
      prev.map((r) => (r.recipeId === recipeId ? { ...r, servings } : r))
    );
  }

  async function handleSave() {
    setIsSubmitting(true);
    try {
      await setMealSlot({
        weeklyPlanId,
        dayOfWeek,
        mealType,
        recipes: selectedRecipes,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to set meal slot:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveAll() {
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
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {DAYS[dayOfWeek]} - {MEAL_LABELS[mealType]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected recipes list */}
          {selectedRecipes.length > 0 && (
            <div className="space-y-3">
              <Label>Selected Recipes</Label>
              {selectedRecipes.map((selected) => {
                const recipe = recipes.find((r) => r.id === selected.recipeId);
                if (!recipe) return null;
                return (
                  <div
                    key={selected.recipeId}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{recipe.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Default: {recipe.servings} servings
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={selected.servings}
                        onChange={(e) =>
                          handleServingsChange(
                            selected.recipeId,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRecipe(selected.recipeId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add recipe dropdown */}
          <div className="space-y-2">
            <Label>Add Recipe</Label>
            <Select onValueChange={handleAddRecipe} value="">
              <SelectTrigger>
                <SelectValue placeholder="Select a recipe to add" />
              </SelectTrigger>
              <SelectContent>
                {availableRecipes.map((recipe) => (
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
            {recipes.length > 0 && availableRecipes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All recipes have been added to this meal.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {currentSlot?.id && currentSlot.mealSlotRecipes.length > 0 ? (
            <Button
              variant="destructive"
              onClick={handleRemoveAll}
              disabled={isRemoving || isSubmitting}
              className="order-last sm:order-first"
            >
              {isRemoving ? "Removing..." : "Remove All"}
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || isRemoving}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
