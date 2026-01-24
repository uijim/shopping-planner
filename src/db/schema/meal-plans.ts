import { pgTable, text, uuid, integer, date, pgEnum } from "drizzle-orm/pg-core";
import { recipes } from "./recipes";

export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
]);

export const weeklyPlans = pgTable("weekly_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  weekStartDate: date("week_start_date").notNull(),
});

export const mealSlots = pgTable("meal_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  weeklyPlanId: uuid("weekly_plan_id")
    .notNull()
    .references(() => weeklyPlans.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Monday-Saturday, Sunday)
  mealType: mealTypeEnum("meal_type").notNull(),
});

export const mealSlotRecipes = pgTable("meal_slot_recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  mealSlotId: uuid("meal_slot_id")
    .notNull()
    .references(() => mealSlots.id, { onDelete: "cascade" }),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  servings: integer("servings").notNull().default(4),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type WeeklyPlan = typeof weeklyPlans.$inferSelect;
export type NewWeeklyPlan = typeof weeklyPlans.$inferInsert;
export type MealSlot = typeof mealSlots.$inferSelect;
export type NewMealSlot = typeof mealSlots.$inferInsert;
export type MealSlotRecipe = typeof mealSlotRecipes.$inferSelect;
export type NewMealSlotRecipe = typeof mealSlotRecipes.$inferInsert;
