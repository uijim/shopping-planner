"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  weeklyPlans,
  mealSlots,
  mealSlotRecipes,
  customShoppingItems,
  savedShoppingItems,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
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
          mealSlotRecipes: {
            with: {
              recipe: true,
            },
            orderBy: (msr, { asc }) => [asc(msr.sortOrder)],
          },
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

interface RecipeInSlot {
  recipeId: string;
  servings: number;
}

interface SetMealSlotInput {
  weeklyPlanId: string;
  dayOfWeek: number; // 0-6 (Monday-Sunday in our UI)
  mealType: "breakfast" | "lunch" | "dinner";
  recipes: RecipeInSlot[];
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

  if (input.recipes.length === 0) {
    // Remove the slot if no recipes
    if (existingSlot) {
      await db.delete(mealSlots).where(eq(mealSlots.id, existingSlot.id));
    }
  } else if (existingSlot) {
    // Update existing slot: delete old recipes and insert new ones
    await db
      .delete(mealSlotRecipes)
      .where(eq(mealSlotRecipes.mealSlotId, existingSlot.id));

    await db.insert(mealSlotRecipes).values(
      input.recipes.map((r, index) => ({
        mealSlotId: existingSlot.id,
        recipeId: r.recipeId,
        servings: r.servings,
        sortOrder: index,
      }))
    );
  } else {
    // Create new slot with recipes
    const [newSlot] = await db
      .insert(mealSlots)
      .values({
        weeklyPlanId: input.weeklyPlanId,
        dayOfWeek: input.dayOfWeek,
        mealType: input.mealType,
      })
      .returning();

    await db.insert(mealSlotRecipes).values(
      input.recipes.map((r, index) => ({
        mealSlotId: newSlot.id,
        recipeId: r.recipeId,
        servings: r.servings,
        sortOrder: index,
      }))
    );
  }

  revalidatePath("/plan");
}

interface AddRecipeToSlotInput {
  weeklyPlanId: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner";
  recipeId: string;
  servings: number;
}

export async function addRecipeToSlot(input: AddRecipeToSlotInput) {
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

  // Find or create the meal slot
  let slot = await db.query.mealSlots.findFirst({
    where: and(
      eq(mealSlots.weeklyPlanId, input.weeklyPlanId),
      eq(mealSlots.dayOfWeek, input.dayOfWeek),
      eq(mealSlots.mealType, input.mealType)
    ),
    with: {
      mealSlotRecipes: true,
    },
  });

  if (!slot) {
    const [newSlot] = await db
      .insert(mealSlots)
      .values({
        weeklyPlanId: input.weeklyPlanId,
        dayOfWeek: input.dayOfWeek,
        mealType: input.mealType,
      })
      .returning();
    slot = { ...newSlot, mealSlotRecipes: [] };
  }

  // Get the next sort order
  const maxSortOrder = slot.mealSlotRecipes.reduce(
    (max, r) => Math.max(max, r.sortOrder),
    -1
  );

  // Add the recipe
  await db.insert(mealSlotRecipes).values({
    mealSlotId: slot.id,
    recipeId: input.recipeId,
    servings: input.servings,
    sortOrder: maxSortOrder + 1,
  });

  revalidatePath("/plan");
}

interface RemoveRecipeFromSlotInput {
  mealSlotRecipeId: string;
}

export async function removeRecipeFromSlot(input: RemoveRecipeFromSlotInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the meal slot recipe and verify ownership
  const mealSlotRecipe = await db.query.mealSlotRecipes.findFirst({
    where: eq(mealSlotRecipes.id, input.mealSlotRecipeId),
    with: {
      mealSlot: {
        with: {
          weeklyPlan: true,
        },
      },
    },
  });

  if (!mealSlotRecipe || mealSlotRecipe.mealSlot.weeklyPlan.userId !== userId) {
    throw new Error("Meal slot recipe not found");
  }

  const mealSlotId = mealSlotRecipe.mealSlotId;

  // Delete the recipe from the slot
  await db
    .delete(mealSlotRecipes)
    .where(eq(mealSlotRecipes.id, input.mealSlotRecipeId));

  // Check if the slot has any remaining recipes
  const remainingRecipes = await db.query.mealSlotRecipes.findMany({
    where: eq(mealSlotRecipes.mealSlotId, mealSlotId),
  });

  // If no recipes left, delete the slot
  if (remainingRecipes.length === 0) {
    await db.delete(mealSlots).where(eq(mealSlots.id, mealSlotId));
  }

  revalidatePath("/plan");
}

interface UpdateRecipeServingsInput {
  mealSlotRecipeId: string;
  servings: number;
}

export async function updateRecipeServings(input: UpdateRecipeServingsInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the meal slot recipe and verify ownership
  const mealSlotRecipe = await db.query.mealSlotRecipes.findFirst({
    where: eq(mealSlotRecipes.id, input.mealSlotRecipeId),
    with: {
      mealSlot: {
        with: {
          weeklyPlan: true,
        },
      },
    },
  });

  if (!mealSlotRecipe || mealSlotRecipe.mealSlot.weeklyPlan.userId !== userId) {
    throw new Error("Meal slot recipe not found");
  }

  await db
    .update(mealSlotRecipes)
    .set({ servings: input.servings })
    .where(eq(mealSlotRecipes.id, input.mealSlotRecipeId));

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

export async function clearAllMeals(weeklyPlanId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the weekly plan belongs to the user
  const plan = await db.query.weeklyPlans.findFirst({
    where: eq(weeklyPlans.id, weeklyPlanId),
  });

  if (!plan || plan.userId !== userId) {
    throw new Error("Weekly plan not found");
  }

  await db.delete(mealSlots).where(eq(mealSlots.weeklyPlanId, weeklyPlanId));

  revalidatePath("/plan");
}

export interface ShoppingListItem {
  productId: string;
  productName: string;
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
          mealSlotRecipes: {
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
      totalBaseQuantity: number;
      baseUnit: "g" | "ml" | "unit";
      displayUnit: string;
    }
  >();

  for (const slot of plan.mealSlots) {
    for (const msr of slot.mealSlotRecipes) {
      if (!msr.recipe) continue;

      const recipe = msr.recipe;
      const servingsScale = msr.servings / recipe.servings;

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
            totalBaseQuantity: scaledQuantity,
            baseUnit: rp.baseUnit,
            displayUnit: rp.unit,
          });
        }
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

  // Sort alphabetically by name
  items.sort((a, b) => a.productName.localeCompare(b.productName));

  return { items, weekStartDate: plan.weekStartDate };
}

function formatDisplayQuantity(baseQuantity: number): number {
  // Round to 2 decimal places for cleaner display
  return Math.round(baseQuantity * 100) / 100;
}

export interface CustomShoppingItemData {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  isChecked: boolean;
}

export async function getCustomItemsForPlan(
  weeklyPlanId: string
): Promise<CustomShoppingItemData[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the weekly plan belongs to the user
  const plan = await db.query.weeklyPlans.findFirst({
    where: eq(weeklyPlans.id, weeklyPlanId),
  });

  if (!plan || plan.userId !== userId) {
    throw new Error("Weekly plan not found");
  }

  const items = await db.query.customShoppingItems.findMany({
    where: eq(customShoppingItems.weeklyPlanId, weeklyPlanId),
    orderBy: (items, { asc }) => [asc(items.name)],
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    isChecked: item.isChecked,
  }));
}

interface AddCustomItemInput {
  weeklyPlanId: string;
  name: string;
  quantity?: number;
  unit?: string;
}

export async function addCustomItem(input: AddCustomItemInput) {
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

  await db.insert(customShoppingItems).values({
    weeklyPlanId: input.weeklyPlanId,
    name: input.name,
    quantity: input.quantity ?? null,
    unit: input.unit ?? null,
  });

  revalidatePath("/plan/shopping-list");
}

export async function removeCustomItem(itemId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership through the weekly plan
  const item = await db.query.customShoppingItems.findFirst({
    where: eq(customShoppingItems.id, itemId),
    with: {
      weeklyPlan: true,
    },
  });

  if (!item || item.weeklyPlan.userId !== userId) {
    throw new Error("Item not found");
  }

  await db.delete(customShoppingItems).where(eq(customShoppingItems.id, itemId));

  revalidatePath("/plan/shopping-list");
}

export async function toggleCustomItemChecked(itemId: string, isChecked: boolean) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership through the weekly plan
  const item = await db.query.customShoppingItems.findFirst({
    where: eq(customShoppingItems.id, itemId),
    with: {
      weeklyPlan: true,
    },
  });

  if (!item || item.weeklyPlan.userId !== userId) {
    throw new Error("Item not found");
  }

  await db
    .update(customShoppingItems)
    .set({ isChecked })
    .where(eq(customShoppingItems.id, itemId));

  revalidatePath("/plan/shopping-list");
}

export async function clearAllCustomItems(weeklyPlanId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the weekly plan belongs to the user
  const plan = await db.query.weeklyPlans.findFirst({
    where: eq(weeklyPlans.id, weeklyPlanId),
  });

  if (!plan || plan.userId !== userId) {
    throw new Error("Weekly plan not found");
  }

  await db
    .delete(customShoppingItems)
    .where(eq(customShoppingItems.weeklyPlanId, weeklyPlanId));

  revalidatePath("/plan/shopping-list");
}

interface BulkAddFromSavedInput {
  weeklyPlanId: string;
  savedItemIds: string[];
}

export async function bulkAddFromSaved(input: BulkAddFromSavedInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (input.savedItemIds.length === 0) {
    return;
  }

  // Verify the weekly plan belongs to the user
  const plan = await db.query.weeklyPlans.findFirst({
    where: eq(weeklyPlans.id, input.weeklyPlanId),
  });

  if (!plan || plan.userId !== userId) {
    throw new Error("Weekly plan not found");
  }

  // Fetch saved items (verify user owns them)
  const savedItems = await db.query.savedShoppingItems.findMany({
    where: and(
      inArray(savedShoppingItems.id, input.savedItemIds),
      eq(savedShoppingItems.userId, userId)
    ),
  });

  if (savedItems.length === 0) {
    return;
  }

  // Insert as customShoppingItems for the week
  await db.insert(customShoppingItems).values(
    savedItems.map((item) => ({
      weeklyPlanId: input.weeklyPlanId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    }))
  );

  revalidatePath("/plan/shopping-list");
}
