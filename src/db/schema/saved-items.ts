import { pgTable, text, uuid, real, timestamp } from "drizzle-orm/pg-core";

export const savedShoppingItems = pgTable("saved_shopping_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  quantity: real("quantity"),
  unit: text("unit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SavedShoppingItem = typeof savedShoppingItems.$inferSelect;
export type NewSavedShoppingItem = typeof savedShoppingItems.$inferInsert;
