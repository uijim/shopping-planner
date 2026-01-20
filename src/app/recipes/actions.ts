"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { recipes, recipeProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRecipes() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db.query.recipes.findMany({
    where: eq(recipes.userId, userId),
    with: {
      recipeProducts: {
        with: {
          product: true,
        },
      },
    },
  });
}

export async function getProducts() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get global products (userId is null) and user's custom products
  const { products } = await import("@/db/schema");
  const { or, isNull } = await import("drizzle-orm");

  return db.query.products.findMany({
    where: or(isNull(products.userId), eq(products.userId, userId)),
    orderBy: (products, { asc }) => [asc(products.name)],
  });
}

interface RecipeIngredient {
  productId: string;
  quantity: number;
  unit: string;
  baseQuantity: number;
  baseUnit: "g" | "ml" | "unit";
  notes?: string;
}

interface CreateRecipeInput {
  name: string;
  description?: string;
  servings: number;
  ingredients: RecipeIngredient[];
}

export async function createRecipe(input: CreateRecipeInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [recipe] = await db
    .insert(recipes)
    .values({
      userId,
      name: input.name,
      description: input.description || null,
      servings: input.servings,
    })
    .returning();

  if (input.ingredients.length > 0) {
    await db.insert(recipeProducts).values(
      input.ingredients.map((ing) => ({
        recipeId: recipe.id,
        productId: ing.productId,
        quantity: ing.quantity,
        unit: ing.unit,
        baseQuantity: ing.baseQuantity,
        baseUnit: ing.baseUnit,
        notes: ing.notes || null,
      }))
    );
  }

  revalidatePath("/recipes");
  return recipe;
}

interface UpdateRecipeInput {
  id: string;
  name: string;
  description?: string;
  servings: number;
  ingredients: RecipeIngredient[];
}

export async function updateRecipe(input: UpdateRecipeInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the recipe belongs to the user
  const existing = await db.query.recipes.findFirst({
    where: eq(recipes.id, input.id),
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Recipe not found");
  }

  // Update recipe
  const [recipe] = await db
    .update(recipes)
    .set({
      name: input.name,
      description: input.description || null,
      servings: input.servings,
    })
    .where(eq(recipes.id, input.id))
    .returning();

  // Delete existing ingredients and insert new ones
  await db.delete(recipeProducts).where(eq(recipeProducts.recipeId, input.id));

  if (input.ingredients.length > 0) {
    await db.insert(recipeProducts).values(
      input.ingredients.map((ing) => ({
        recipeId: recipe.id,
        productId: ing.productId,
        quantity: ing.quantity,
        unit: ing.unit,
        baseQuantity: ing.baseQuantity,
        baseUnit: ing.baseUnit,
        notes: ing.notes || null,
      }))
    );
  }

  revalidatePath("/recipes");
  return recipe;
}

export async function deleteRecipe(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the recipe belongs to the user
  const existing = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Recipe not found");
  }

  await db.delete(recipes).where(eq(recipes.id, id));

  revalidatePath("/recipes");
}
