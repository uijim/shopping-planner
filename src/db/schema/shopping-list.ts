import {
  pgTable,
  text,
  uuid,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { weeklyPlans } from "./meal-plans";
import { products } from "./products";
import { baseUnitEnum } from "./units";

export const shoppingLists = pgTable("shopping_lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  weeklyPlanId: uuid("weekly_plan_id").references(() => weeklyPlans.id, {
    onDelete: "set null",
  }), // optional - null for standalone lists
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  shoppingListId: uuid("shopping_list_id")
    .notNull()
    .references(() => shoppingLists.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  aggregatedBaseQuantity: real("aggregated_base_quantity").notNull(),
  aggregatedBaseUnit: baseUnitEnum("aggregated_base_unit").notNull(),
  displayQuantity: real("display_quantity").notNull(),
  displayUnit: text("display_unit").notNull(),
  isChecked: boolean("is_checked").notNull().default(false),
});

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type NewShoppingList = typeof shoppingLists.$inferInsert;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type NewShoppingListItem = typeof shoppingListItems.$inferInsert;
