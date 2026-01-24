import { pgTable, text, uuid, pgEnum } from "drizzle-orm/pg-core";

export const baseUnitEnum = pgEnum("base_unit", ["g", "ml", "unit"]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"), // null = global product, non-null = user's custom product
  name: text("name").notNull(),
  category: text("category"),
  defaultUnit: baseUnitEnum("default_unit").notNull().default("unit"),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
