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
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  mealType: mealTypeEnum("meal_type").notNull(),
  recipeId: uuid("recipe_id").references(() => recipes.id, {
    onDelete: "set null",
  }),
  servings: integer("servings").notNull().default(4), // allows scaling recipes
});

export type WeeklyPlan = typeof weeklyPlans.$inferSelect;
export type NewWeeklyPlan = typeof weeklyPlans.$inferInsert;
export type MealSlot = typeof mealSlots.$inferSelect;
export type NewMealSlot = typeof mealSlots.$inferInsert;
