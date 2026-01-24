CREATE TABLE "meal_slot_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_slot_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"servings" integer DEFAULT 4 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_shopping_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"weekly_plan_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" real,
	"unit" text,
	"is_checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_shopping_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"quantity" real,
	"unit" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meal_slots" DROP CONSTRAINT "meal_slots_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "meal_slot_recipes" ADD CONSTRAINT "meal_slot_recipes_meal_slot_id_meal_slots_id_fk" FOREIGN KEY ("meal_slot_id") REFERENCES "public"."meal_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_slot_recipes" ADD CONSTRAINT "meal_slot_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shopping_items" ADD CONSTRAINT "custom_shopping_items_weekly_plan_id_weekly_plans_id_fk" FOREIGN KEY ("weekly_plan_id") REFERENCES "public"."weekly_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Data migration: Copy existing meal slot data to the junction table
INSERT INTO "meal_slot_recipes" ("meal_slot_id", "recipe_id", "servings", "sort_order")
SELECT "id", "recipe_id", "servings", 0
FROM "meal_slots"
WHERE "recipe_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "meal_slots" DROP COLUMN "recipe_id";--> statement-breakpoint
ALTER TABLE "meal_slots" DROP COLUMN "servings";