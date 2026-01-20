import { pgTable, text, uuid, pgEnum } from "drizzle-orm/pg-core";

export const measurementSystemEnum = pgEnum("measurement_system", [
  "metric",
  "imperial",
]);

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  measurementSystem: measurementSystemEnum("measurement_system")
    .notNull()
    .default("metric"),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
