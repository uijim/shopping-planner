"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { weeklyPlans, mealSlots } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Get Monday of current week
function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export async function getOrCreateWeeklyPlan() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const weekStartDate = getWeekStartDate();

  // Try to find existing plan
  let plan = await db.query.weeklyPlans.findFirst({
    where: and(
      eq(weeklyPlans.userId, userId),
      eq(weeklyPlans.weekStartDate, weekStartDate)
    ),
    with: {
      mealSlots: {
        with: {
          recipe: true,
        },
      },
    },
  });

  // Create if doesn't exist
  if (!plan) {
    const [newPlan] = await db
      .insert(weeklyPlans)
      .values({
        userId,
        weekStartDate,
      })
      .returning();

    plan = {
      ...newPlan,
      mealSlots: [],
    };
  }

  return plan;
}

export async function getRecipesForSelection() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { recipes } = await import("@/db/schema");

  return db.query.recipes.findMany({
    where: eq(recipes.userId, userId),
    orderBy: (recipes, { asc }) => [asc(recipes.name)],
  });
}

interface SetMealSlotInput {
  weeklyPlanId: string;
  dayOfWeek: number; // 0-6 (Monday-Sunday in our UI)
  mealType: "breakfast" | "lunch" | "dinner";
  recipeId: string | null;
  servings: number;
}

export async function setMealSlot(input: SetMealSlotInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the weekly plan belongs to the user
  const plan = await db.query.weeklyPlans.findFirst({
    where: eq(weeklyPlans.id, input.weeklyPlanId),
  });

  if (!plan || plan.userId !== userId) {
    throw new Error("Weekly plan not found");
  }

  // Check if slot already exists
  const existingSlot = await db.query.mealSlots.findFirst({
    where: and(
      eq(mealSlots.weeklyPlanId, input.weeklyPlanId),
      eq(mealSlots.dayOfWeek, input.dayOfWeek),
      eq(mealSlots.mealType, input.mealType)
    ),
  });

  if (existingSlot) {
    // Update existing slot
    if (input.recipeId) {
      await db
        .update(mealSlots)
        .set({
          recipeId: input.recipeId,
          servings: input.servings,
        })
        .where(eq(mealSlots.id, existingSlot.id));
    } else {
      // Remove the slot if no recipe selected
      await db.delete(mealSlots).where(eq(mealSlots.id, existingSlot.id));
    }
  } else if (input.recipeId) {
    // Create new slot
    await db.insert(mealSlots).values({
      weeklyPlanId: input.weeklyPlanId,
      dayOfWeek: input.dayOfWeek,
      mealType: input.mealType,
      recipeId: input.recipeId,
      servings: input.servings,
    });
  }

  revalidatePath("/plan");
}

export async function removeMealSlot(slotId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the slot and verify ownership through the weekly plan
  const slot = await db.query.mealSlots.findFirst({
    where: eq(mealSlots.id, slotId),
    with: {
      weeklyPlan: true,
    },
  });

  if (!slot || slot.weeklyPlan.userId !== userId) {
    throw new Error("Meal slot not found");
  }

  await db.delete(mealSlots).where(eq(mealSlots.id, slotId));

  revalidatePath("/plan");
}

export interface ShoppingListItem {
  productId: string;
  productName: string;
  category: string;
  totalBaseQuantity: number;
  baseUnit: "g" | "ml" | "unit";
  displayQuantity: number;
  displayUnit: string;
}

export async function getShoppingListForPlan(weeklyPlanId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the weekly plan belongs to the user
  const plan = await db.query.weeklyPlans.findFirst({
    where: eq(weeklyPlans.id, weeklyPlanId),
    with: {
      mealSlots: {
        with: {
          recipe: {
            with: {
              recipeProducts: {
                with: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!plan || plan.userId !== userId) {
    throw new Error("Weekly plan not found");
  }

  // Aggregate ingredients by product
  const aggregated = new Map<
    string,
    {
      productId: string;
      productName: string;
      category: string;
      totalBaseQuantity: number;
      baseUnit: "g" | "ml" | "unit";
      displayUnit: string;
    }
  >();

  for (const slot of plan.mealSlots) {
    if (!slot.recipe) continue;

    const recipe = slot.recipe;
    const servingsScale = slot.servings / recipe.servings;

    for (const rp of recipe.recipeProducts) {
      const key = `${rp.productId}-${rp.baseUnit}`;
      const scaledQuantity = rp.baseQuantity * servingsScale;

      if (aggregated.has(key)) {
        const existing = aggregated.get(key)!;
        existing.totalBaseQuantity += scaledQuantity;
      } else {
        aggregated.set(key, {
          productId: rp.productId,
          productName: rp.product.name,
          category: rp.product.category,
          totalBaseQuantity: scaledQuantity,
          baseUnit: rp.baseUnit,
          displayUnit: rp.unit,
        });
      }
    }
  }

  // Convert to array and format display quantities
  const items: ShoppingListItem[] = Array.from(aggregated.values()).map(
    (item) => ({
      ...item,
      displayQuantity: formatDisplayQuantity(item.totalBaseQuantity),
    })
  );

  // Sort by category then by name
  items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.productName.localeCompare(b.productName);
  });

  return { items, weekStartDate: plan.weekStartDate };
}

function formatDisplayQuantity(baseQuantity: number): number {
  // Round to 2 decimal places for cleaner display
  return Math.round(baseQuantity * 100) / 100;
}
