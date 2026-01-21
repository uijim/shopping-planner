import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, isNull } from "drizzle-orm";
import { recipes, recipeProducts } from "./schema/recipes";
import { products } from "./schema/products";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const USER_ID = "user_38X5b8ATRuMiaVr2A3n2CGxewXf";

interface RecipeData {
  name: string;
  description: string;
  servings: number;
  ingredients: {
    productName: string;
    quantity: number;
    unit: string;
    baseQuantity: number;
    baseUnit: "g" | "ml" | "unit";
    notes?: string;
  }[];
}

const sampleRecipes: RecipeData[] = [
  {
    name: "Scrambled Eggs",
    description: "Fluffy scrambled eggs with butter",
    servings: 2,
    ingredients: [
      { productName: "Eggs", quantity: 4, unit: "unit", baseQuantity: 4, baseUnit: "unit" },
      { productName: "Butter", quantity: 20, unit: "g", baseQuantity: 20, baseUnit: "g" },
      { productName: "Salt", quantity: 2, unit: "g", baseQuantity: 2, baseUnit: "g" },
      { productName: "Pepper", quantity: 1, unit: "g", baseQuantity: 1, baseUnit: "g" },
    ],
  },
  {
    name: "Spaghetti with Tomato Sauce",
    description: "Classic pasta with homemade tomato sauce",
    servings: 4,
    ingredients: [
      { productName: "Pasta", quantity: 400, unit: "g", baseQuantity: 400, baseUnit: "g" },
      { productName: "Canned Tomatoes", quantity: 2, unit: "can", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Garlic", quantity: 3, unit: "clove", baseQuantity: 3, baseUnit: "unit" },
      { productName: "Onion", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Olive Oil", quantity: 30, unit: "ml", baseQuantity: 30, baseUnit: "ml" },
      { productName: "Basil", quantity: 10, unit: "g", baseQuantity: 10, baseUnit: "g" },
      { productName: "Salt", quantity: 5, unit: "g", baseQuantity: 5, baseUnit: "g" },
    ],
  },
  {
    name: "Chicken Stir Fry",
    description: "Quick and healthy chicken with vegetables",
    servings: 4,
    ingredients: [
      { productName: "Chicken Breast", quantity: 500, unit: "g", baseQuantity: 500, baseUnit: "g" },
      { productName: "Bell Pepper", quantity: 2, unit: "unit", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Broccoli", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Carrots", quantity: 2, unit: "unit", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Soy Sauce", quantity: 45, unit: "ml", baseQuantity: 45, baseUnit: "ml" },
      { productName: "Garlic", quantity: 2, unit: "clove", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Ginger", quantity: 10, unit: "g", baseQuantity: 10, baseUnit: "g" },
      { productName: "Vegetable Oil", quantity: 30, unit: "ml", baseQuantity: 30, baseUnit: "ml" },
    ],
  },
  {
    name: "Caesar Salad",
    description: "Classic Caesar salad with homemade dressing",
    servings: 2,
    ingredients: [
      { productName: "Lettuce", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Chicken Breast", quantity: 200, unit: "g", baseQuantity: 200, baseUnit: "g" },
      { productName: "Cheese", quantity: 50, unit: "g", baseQuantity: 50, baseUnit: "g", notes: "Parmesan" },
      { productName: "Bread", quantity: 2, unit: "slice", baseQuantity: 2, baseUnit: "unit", notes: "For croutons" },
      { productName: "Olive Oil", quantity: 45, unit: "ml", baseQuantity: 45, baseUnit: "ml" },
      { productName: "Garlic", quantity: 1, unit: "clove", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Lemons", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
    ],
  },
  {
    name: "Grilled Salmon",
    description: "Simple grilled salmon with lemon and herbs",
    servings: 2,
    ingredients: [
      { productName: "Salmon", quantity: 400, unit: "g", baseQuantity: 400, baseUnit: "g" },
      { productName: "Lemons", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Olive Oil", quantity: 20, unit: "ml", baseQuantity: 20, baseUnit: "ml" },
      { productName: "Thyme", quantity: 5, unit: "g", baseQuantity: 5, baseUnit: "g" },
      { productName: "Salt", quantity: 3, unit: "g", baseQuantity: 3, baseUnit: "g" },
      { productName: "Pepper", quantity: 2, unit: "g", baseQuantity: 2, baseUnit: "g" },
    ],
  },
  {
    name: "Beef Tacos",
    description: "Seasoned ground beef tacos with fresh toppings",
    servings: 4,
    ingredients: [
      { productName: "Ground Beef", quantity: 500, unit: "g", baseQuantity: 500, baseUnit: "g" },
      { productName: "Onion", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Tomatoes", quantity: 2, unit: "unit", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Lettuce", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Cheese", quantity: 100, unit: "g", baseQuantity: 100, baseUnit: "g" },
      { productName: "Cumin", quantity: 5, unit: "g", baseQuantity: 5, baseUnit: "g" },
      { productName: "Chili Powder", quantity: 5, unit: "g", baseQuantity: 5, baseUnit: "g" },
      { productName: "Sour Cream", quantity: 100, unit: "g", baseQuantity: 100, baseUnit: "g" },
    ],
  },
  {
    name: "Banana Pancakes",
    description: "Fluffy pancakes with mashed banana",
    servings: 2,
    ingredients: [
      { productName: "Bananas", quantity: 2, unit: "unit", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Eggs", quantity: 2, unit: "unit", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Flour", quantity: 150, unit: "g", baseQuantity: 150, baseUnit: "g" },
      { productName: "Milk", quantity: 200, unit: "ml", baseQuantity: 200, baseUnit: "ml" },
      { productName: "Baking Powder", quantity: 5, unit: "g", baseQuantity: 5, baseUnit: "g" },
      { productName: "Butter", quantity: 30, unit: "g", baseQuantity: 30, baseUnit: "g" },
      { productName: "Honey", quantity: 30, unit: "ml", baseQuantity: 30, baseUnit: "ml" },
    ],
  },
  {
    name: "Vegetable Soup",
    description: "Hearty vegetable soup with fresh herbs",
    servings: 6,
    ingredients: [
      { productName: "Carrots", quantity: 3, unit: "unit", baseQuantity: 3, baseUnit: "unit" },
      { productName: "Celery", quantity: 2, unit: "unit", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Onion", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Potatoes", quantity: 300, unit: "g", baseQuantity: 300, baseUnit: "g" },
      { productName: "Canned Tomatoes", quantity: 1, unit: "can", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Chicken Stock", quantity: 1000, unit: "ml", baseQuantity: 1000, baseUnit: "ml" },
      { productName: "Thyme", quantity: 3, unit: "g", baseQuantity: 3, baseUnit: "g" },
      { productName: "Parsley", quantity: 10, unit: "g", baseQuantity: 10, baseUnit: "g" },
    ],
  },
  {
    name: "Garlic Butter Shrimp",
    description: "Succulent shrimp in garlic butter sauce",
    servings: 2,
    ingredients: [
      { productName: "Shrimp", quantity: 400, unit: "g", baseQuantity: 400, baseUnit: "g" },
      { productName: "Butter", quantity: 50, unit: "g", baseQuantity: 50, baseUnit: "g" },
      { productName: "Garlic", quantity: 4, unit: "clove", baseQuantity: 4, baseUnit: "unit" },
      { productName: "Lemons", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Parsley", quantity: 10, unit: "g", baseQuantity: 10, baseUnit: "g" },
      { productName: "Salt", quantity: 2, unit: "g", baseQuantity: 2, baseUnit: "g" },
    ],
  },
  {
    name: "Mushroom Risotto",
    description: "Creamy Italian risotto with mushrooms",
    servings: 4,
    ingredients: [
      { productName: "Rice", quantity: 300, unit: "g", baseQuantity: 300, baseUnit: "g", notes: "Arborio rice preferred" },
      { productName: "Mushrooms", quantity: 250, unit: "g", baseQuantity: 250, baseUnit: "g" },
      { productName: "Onion", quantity: 1, unit: "unit", baseQuantity: 1, baseUnit: "unit" },
      { productName: "Garlic", quantity: 2, unit: "clove", baseQuantity: 2, baseUnit: "unit" },
      { productName: "Chicken Stock", quantity: 750, unit: "ml", baseQuantity: 750, baseUnit: "ml" },
      { productName: "Butter", quantity: 40, unit: "g", baseQuantity: 40, baseUnit: "g" },
      { productName: "Cheese", quantity: 50, unit: "g", baseQuantity: 50, baseUnit: "g", notes: "Parmesan" },
      { productName: "Thyme", quantity: 3, unit: "g", baseQuantity: 3, baseUnit: "g" },
    ],
  },
];

async function seedRecipes() {
  console.log("Seeding recipes for user:", USER_ID);

  // Get all global products (userId is null)
  const globalProducts = await db
    .select()
    .from(products)
    .where(isNull(products.userId));

  const productMap = new Map(globalProducts.map((p) => [p.name, p.id]));

  console.log(`Found ${globalProducts.length} global products`);

  for (const recipe of sampleRecipes) {
    console.log(`Creating recipe: ${recipe.name}`);

    // Insert recipe
    const [insertedRecipe] = await db
      .insert(recipes)
      .values({
        userId: USER_ID,
        name: recipe.name,
        description: recipe.description,
        servings: recipe.servings,
      })
      .returning();

    // Insert ingredients
    const ingredientValues = recipe.ingredients
      .map((ing) => {
        const productId = productMap.get(ing.productName);
        if (!productId) {
          console.warn(`  Warning: Product "${ing.productName}" not found, skipping`);
          return null;
        }
        return {
          recipeId: insertedRecipe.id,
          productId,
          quantity: ing.quantity,
          unit: ing.unit,
          baseQuantity: ing.baseQuantity,
          baseUnit: ing.baseUnit,
          notes: ing.notes || null,
        };
      })
      .filter((v) => v !== null);

    if (ingredientValues.length > 0) {
      await db.insert(recipeProducts).values(ingredientValues);
      console.log(`  Added ${ingredientValues.length} ingredients`);
    }
  }

  console.log("\nSeeding complete! Added", sampleRecipes.length, "recipes");
}

seedRecipes().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
