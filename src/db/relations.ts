import { relations } from "drizzle-orm";
import { products } from "./schema/products";
import { recipes, recipeProducts } from "./schema/recipes";
import { weeklyPlans, mealSlots } from "./schema/meal-plans";
import { shoppingLists, shoppingListItems } from "./schema/shopping-list";

export const productsRelations = relations(products, ({ many }) => ({
  recipeProducts: many(recipeProducts),
  shoppingListItems: many(shoppingListItems),
}));

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeProducts: many(recipeProducts),
  mealSlots: many(mealSlots),
}));

export const recipeProductsRelations = relations(
  recipeProducts,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeProducts.recipeId],
      references: [recipes.id],
    }),
    product: one(products, {
      fields: [recipeProducts.productId],
      references: [products.id],
    }),
  })
);

export const weeklyPlansRelations = relations(weeklyPlans, ({ many }) => ({
  mealSlots: many(mealSlots),
  shoppingLists: many(shoppingLists),
}));

export const mealSlotsRelations = relations(mealSlots, ({ one }) => ({
  weeklyPlan: one(weeklyPlans, {
    fields: [mealSlots.weeklyPlanId],
    references: [weeklyPlans.id],
  }),
  recipe: one(recipes, {
    fields: [mealSlots.recipeId],
    references: [recipes.id],
  }),
}));

export const shoppingListsRelations = relations(
  shoppingLists,
  ({ one, many }) => ({
    weeklyPlan: one(weeklyPlans, {
      fields: [shoppingLists.weeklyPlanId],
      references: [weeklyPlans.id],
    }),
    items: many(shoppingListItems),
  })
);

export const shoppingListItemsRelations = relations(
  shoppingListItems,
  ({ one }) => ({
    shoppingList: one(shoppingLists, {
      fields: [shoppingListItems.shoppingListId],
      references: [shoppingLists.id],
    }),
    product: one(products, {
      fields: [shoppingListItems.productId],
      references: [products.id],
    }),
  })
);
