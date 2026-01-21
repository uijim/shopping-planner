"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { savedShoppingItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface SavedItemData {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
}

export async function getSavedItems(): Promise<SavedItemData[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const items = await db.query.savedShoppingItems.findMany({
    where: eq(savedShoppingItems.userId, userId),
    orderBy: (items, { asc }) => [asc(items.name)],
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
  }));
}

interface CreateSavedItemInput {
  name: string;
  quantity?: number;
  unit?: string;
}

export async function createSavedItem(input: CreateSavedItemInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.insert(savedShoppingItems).values({
    userId,
    name: input.name,
    quantity: input.quantity ?? null,
    unit: input.unit ?? null,
  });

  revalidatePath("/saved-items");
}

interface UpdateSavedItemInput {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
}

export async function updateSavedItem(input: UpdateSavedItemInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const item = await db.query.savedShoppingItems.findFirst({
    where: and(
      eq(savedShoppingItems.id, input.id),
      eq(savedShoppingItems.userId, userId)
    ),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  await db
    .update(savedShoppingItems)
    .set({
      name: input.name,
      quantity: input.quantity ?? null,
      unit: input.unit ?? null,
    })
    .where(eq(savedShoppingItems.id, input.id));

  revalidatePath("/saved-items");
}

export async function deleteSavedItem(itemId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const item = await db.query.savedShoppingItems.findFirst({
    where: and(
      eq(savedShoppingItems.id, itemId),
      eq(savedShoppingItems.userId, userId)
    ),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  await db.delete(savedShoppingItems).where(eq(savedShoppingItems.id, itemId));

  revalidatePath("/saved-items");
}
