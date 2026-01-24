"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealSlotDialog } from "./meal-slot-dialog";
import type { Recipe, MealSlotRecipe } from "@/db/schema";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEALS = ["breakfast", "lunch", "dinner"] as const;
const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
} as const;

type MealType = (typeof MEALS)[number];

interface MealSlotRecipeWithRecipe extends MealSlotRecipe {
  recipe: Recipe;
}

interface MealSlot {
  id: string;
  dayOfWeek: number;
  mealType: MealType;
  mealSlotRecipes: MealSlotRecipeWithRecipe[];
}

interface MealPlannerGridProps {
  weeklyPlanId: string;
  mealSlots: MealSlot[];
  recipes: Recipe[];
}

interface SelectedSlot {
  dayOfWeek: number;
  mealType: MealType;
}

export function MealPlannerGrid({
  weeklyPlanId,
  mealSlots,
  recipes,
}: MealPlannerGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  // Create a lookup map for meal slots
  const slotMap = new Map<string, MealSlot>();
  for (const slot of mealSlots) {
    const key = `${slot.dayOfWeek}-${slot.mealType}`;
    slotMap.set(key, slot);
  }

  function getSlot(dayOfWeek: number, mealType: MealType): MealSlot | undefined {
    return slotMap.get(`${dayOfWeek}-${mealType}`);
  }

  return (
    <>
      {/* Desktop Grid Layout */}
      <div className="hidden gap-4 md:grid">
        {/* Header row with meal types */}
        <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4">
          <div></div>
          {MEALS.map((meal) => (
            <div
              key={meal}
              className="text-center text-sm font-medium text-muted-foreground"
            >
              {MEAL_LABELS[meal]}
            </div>
          ))}
        </div>

        {/* Day rows */}
        {DAYS.map((day, dayIndex) => (
          <div
            key={day}
            className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4"
          >
            <div className="flex items-center font-medium">{day}</div>
            {MEALS.map((meal) => {
              const slot = getSlot(dayIndex, meal);
              const recipeCount = slot?.mealSlotRecipes?.length || 0;
              return (
                <Card
                  key={`${day}-${meal}`}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() =>
                    setSelectedSlot({ dayOfWeek: dayIndex, mealType: meal })
                  }
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm font-normal">
                      {recipeCount > 0 ? (
                        <ul className="space-y-1">
                          {slot?.mealSlotRecipes.map((msr) => (
                            <li key={msr.id} className="font-medium">
                              {msr.recipe.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">
                          + Add recipe
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {recipeCount === 0 && <div className="h-4"></div>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile Layout - Stacked cards by day */}
      <div className="flex flex-col gap-4 md:hidden">
        {DAYS.map((day, dayIndex) => (
          <Card key={day}>
            <CardHeader className="gap-0 pb-2">
              <CardTitle className="text-base">{day}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {MEALS.map((meal) => {
                const slot = getSlot(dayIndex, meal);
                const recipeCount = slot?.mealSlotRecipes?.length || 0;
                return (
                  <div
                    key={`${day}-${meal}`}
                    className="cursor-pointer rounded-md border p-2 transition-colors hover:bg-accent"
                    onClick={() =>
                      setSelectedSlot({ dayOfWeek: dayIndex, mealType: meal })
                    }
                  >
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      {MEAL_LABELS[meal]}
                    </div>
                    <div className="text-sm">
                      {recipeCount > 0 ? (
                        <ul className="space-y-0.5">
                          {slot?.mealSlotRecipes.map((msr) => (
                            <li key={msr.id} className="truncate font-medium">
                              {msr.recipe.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">+ Add</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSlot && (
        <MealSlotDialog
          weeklyPlanId={weeklyPlanId}
          dayOfWeek={selectedSlot.dayOfWeek}
          mealType={selectedSlot.mealType}
          recipes={recipes}
          currentSlot={getSlot(selectedSlot.dayOfWeek, selectedSlot.mealType)}
          open={!!selectedSlot}
          onOpenChange={(open) => {
            if (!open) setSelectedSlot(null);
          }}
        />
      )}
    </>
  );
}
