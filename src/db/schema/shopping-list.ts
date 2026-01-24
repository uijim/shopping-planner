import {
  pgTable,
  text,
  uuid,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { weeklyPlans } from "./meal-plans";

export const customShoppingItems = pgTable("custom_shopping_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  weeklyPlanId: uuid("weekly_plan_id")
    .notNull()
    .references(() => weeklyPlans.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: real("quantity"),
  unit: text("unit"),
  isChecked: boolean("is_checked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CustomShoppingItem = typeof customShoppingItems.$inferSelect;
export type NewCustomShoppingItem = typeof customShoppingItems.$inferInsert;
