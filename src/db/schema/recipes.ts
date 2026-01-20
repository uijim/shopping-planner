import { pgTable, text, uuid, integer, real } from "drizzle-orm/pg-core";
import { products } from "./products";
import { baseUnitEnum } from "./units";

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  servings: integer("servings").notNull().default(4),
});

export const recipeProducts = pgTable("recipe_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: real("quantity").notNull(), // display quantity (user's input)
  unit: text("unit").notNull(), // display unit (user's input)
  baseQuantity: real("base_quantity").notNull(), // converted to base unit
  baseUnit: baseUnitEnum("base_unit").notNull(), // g, ml, or unit
  notes: text("notes"),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type RecipeProduct = typeof recipeProducts.$inferSelect;
export type NewRecipeProduct = typeof recipeProducts.$inferInsert;
