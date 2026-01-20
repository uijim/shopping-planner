import { pgTable, text, uuid, real, pgEnum } from "drizzle-orm/pg-core";

export const baseUnitEnum = pgEnum("base_unit", ["g", "ml", "unit"]);

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"), // null = built-in unit, non-null = user's custom unit
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  baseUnit: baseUnitEnum("base_unit").notNull(),
  conversionFactor: real("conversion_factor").notNull(), // multiply by this to get base unit
});

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
