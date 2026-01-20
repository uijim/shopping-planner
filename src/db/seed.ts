import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { units } from "./schema/units";
import { products } from "./schema/products";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const builtInUnits = [
  // Weight units (base: grams)
  { name: "gram", abbreviation: "g", baseUnit: "g" as const, conversionFactor: 1 },
  { name: "kilogram", abbreviation: "kg", baseUnit: "g" as const, conversionFactor: 1000 },
  { name: "ounce", abbreviation: "oz", baseUnit: "g" as const, conversionFactor: 28.35 },
  { name: "pound", abbreviation: "lb", baseUnit: "g" as const, conversionFactor: 453.59 },

  // Volume units (base: milliliters)
  { name: "milliliter", abbreviation: "ml", baseUnit: "ml" as const, conversionFactor: 1 },
  { name: "liter", abbreviation: "l", baseUnit: "ml" as const, conversionFactor: 1000 },
  { name: "teaspoon", abbreviation: "tsp", baseUnit: "ml" as const, conversionFactor: 4.93 },
  { name: "tablespoon", abbreviation: "tbsp", baseUnit: "ml" as const, conversionFactor: 14.79 },
  { name: "cup", abbreviation: "cup", baseUnit: "ml" as const, conversionFactor: 236.59 },
  { name: "fluid ounce", abbreviation: "fl oz", baseUnit: "ml" as const, conversionFactor: 29.57 },

  // Count units (base: unit)
  { name: "unit", abbreviation: "unit", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "piece", abbreviation: "pc", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "whole", abbreviation: "whole", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "clove", abbreviation: "clove", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "bunch", abbreviation: "bunch", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "slice", abbreviation: "slice", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "can", abbreviation: "can", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "bottle", abbreviation: "bottle", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "pack", abbreviation: "pack", baseUnit: "unit" as const, conversionFactor: 1 },
  { name: "bag", abbreviation: "bag", baseUnit: "unit" as const, conversionFactor: 1 },
];

const globalProducts = [
  // Dairy
  { name: "Eggs", category: "Dairy", defaultUnit: "unit" as const },
  { name: "Milk", category: "Dairy", defaultUnit: "ml" as const },
  { name: "Butter", category: "Dairy", defaultUnit: "g" as const },
  { name: "Cheese", category: "Dairy", defaultUnit: "g" as const },
  { name: "Yogurt", category: "Dairy", defaultUnit: "g" as const },
  { name: "Cream", category: "Dairy", defaultUnit: "ml" as const },
  { name: "Sour Cream", category: "Dairy", defaultUnit: "g" as const },

  // Meat & Poultry
  { name: "Chicken Breast", category: "Meat & Poultry", defaultUnit: "g" as const },
  { name: "Chicken Thighs", category: "Meat & Poultry", defaultUnit: "g" as const },
  { name: "Ground Beef", category: "Meat & Poultry", defaultUnit: "g" as const },
  { name: "Beef Steak", category: "Meat & Poultry", defaultUnit: "g" as const },
  { name: "Pork Chops", category: "Meat & Poultry", defaultUnit: "g" as const },
  { name: "Bacon", category: "Meat & Poultry", defaultUnit: "g" as const },
  { name: "Sausages", category: "Meat & Poultry", defaultUnit: "unit" as const },
  { name: "Ham", category: "Meat & Poultry", defaultUnit: "g" as const },
  { name: "Turkey", category: "Meat & Poultry", defaultUnit: "g" as const },

  // Seafood
  { name: "Salmon", category: "Seafood", defaultUnit: "g" as const },
  { name: "Tuna", category: "Seafood", defaultUnit: "g" as const },
  { name: "Shrimp", category: "Seafood", defaultUnit: "g" as const },
  { name: "Cod", category: "Seafood", defaultUnit: "g" as const },

  // Vegetables
  { name: "Onion", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Garlic", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Tomatoes", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Potatoes", category: "Vegetables", defaultUnit: "g" as const },
  { name: "Carrots", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Broccoli", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Spinach", category: "Vegetables", defaultUnit: "g" as const },
  { name: "Lettuce", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Cucumber", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Bell Pepper", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Mushrooms", category: "Vegetables", defaultUnit: "g" as const },
  { name: "Celery", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Zucchini", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Green Beans", category: "Vegetables", defaultUnit: "g" as const },
  { name: "Corn", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Peas", category: "Vegetables", defaultUnit: "g" as const },
  { name: "Cabbage", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Cauliflower", category: "Vegetables", defaultUnit: "unit" as const },
  { name: "Asparagus", category: "Vegetables", defaultUnit: "g" as const },
  { name: "Avocado", category: "Vegetables", defaultUnit: "unit" as const },

  // Fruits
  { name: "Apples", category: "Fruits", defaultUnit: "unit" as const },
  { name: "Bananas", category: "Fruits", defaultUnit: "unit" as const },
  { name: "Oranges", category: "Fruits", defaultUnit: "unit" as const },
  { name: "Lemons", category: "Fruits", defaultUnit: "unit" as const },
  { name: "Limes", category: "Fruits", defaultUnit: "unit" as const },
  { name: "Strawberries", category: "Fruits", defaultUnit: "g" as const },
  { name: "Blueberries", category: "Fruits", defaultUnit: "g" as const },
  { name: "Grapes", category: "Fruits", defaultUnit: "g" as const },

  // Pantry Staples
  { name: "Flour", category: "Pantry", defaultUnit: "g" as const },
  { name: "Sugar", category: "Pantry", defaultUnit: "g" as const },
  { name: "Brown Sugar", category: "Pantry", defaultUnit: "g" as const },
  { name: "Salt", category: "Pantry", defaultUnit: "g" as const },
  { name: "Pepper", category: "Pantry", defaultUnit: "g" as const },
  { name: "Olive Oil", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Vegetable Oil", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Rice", category: "Pantry", defaultUnit: "g" as const },
  { name: "Pasta", category: "Pantry", defaultUnit: "g" as const },
  { name: "Bread", category: "Pantry", defaultUnit: "unit" as const },
  { name: "Oats", category: "Pantry", defaultUnit: "g" as const },
  { name: "Honey", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Soy Sauce", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Vinegar", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Tomato Paste", category: "Pantry", defaultUnit: "g" as const },
  { name: "Canned Tomatoes", category: "Pantry", defaultUnit: "unit" as const },
  { name: "Chicken Stock", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Beef Stock", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Coconut Milk", category: "Pantry", defaultUnit: "ml" as const },
  { name: "Peanut Butter", category: "Pantry", defaultUnit: "g" as const },
  { name: "Baking Powder", category: "Pantry", defaultUnit: "g" as const },
  { name: "Baking Soda", category: "Pantry", defaultUnit: "g" as const },
  { name: "Vanilla Extract", category: "Pantry", defaultUnit: "ml" as const },

  // Herbs & Spices
  { name: "Basil", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Oregano", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Thyme", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Rosemary", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Parsley", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Cilantro", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Cinnamon", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Cumin", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Paprika", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Chili Powder", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Ginger", category: "Herbs & Spices", defaultUnit: "g" as const },
  { name: "Turmeric", category: "Herbs & Spices", defaultUnit: "g" as const },

  // Beverages
  { name: "Coffee", category: "Beverages", defaultUnit: "g" as const },
  { name: "Tea", category: "Beverages", defaultUnit: "unit" as const },
  { name: "Orange Juice", category: "Beverages", defaultUnit: "ml" as const },
  { name: "Apple Juice", category: "Beverages", defaultUnit: "ml" as const },

  // Household Items
  { name: "Toilet Paper", category: "Household", defaultUnit: "unit" as const },
  { name: "Paper Towels", category: "Household", defaultUnit: "unit" as const },
  { name: "Dish Soap", category: "Household", defaultUnit: "unit" as const },
  { name: "Laundry Detergent", category: "Household", defaultUnit: "unit" as const },
  { name: "Hand Soap", category: "Household", defaultUnit: "unit" as const },
  { name: "Sponges", category: "Household", defaultUnit: "unit" as const },
  { name: "Trash Bags", category: "Household", defaultUnit: "unit" as const },
  { name: "Aluminum Foil", category: "Household", defaultUnit: "unit" as const },
  { name: "Plastic Wrap", category: "Household", defaultUnit: "unit" as const },
  { name: "Ziplock Bags", category: "Household", defaultUnit: "unit" as const },

  // Personal Care
  { name: "Shampoo", category: "Personal Care", defaultUnit: "unit" as const },
  { name: "Conditioner", category: "Personal Care", defaultUnit: "unit" as const },
  { name: "Toothpaste", category: "Personal Care", defaultUnit: "unit" as const },
  { name: "Deodorant", category: "Personal Care", defaultUnit: "unit" as const },
  { name: "Body Wash", category: "Personal Care", defaultUnit: "unit" as const },
];

async function seed() {
  console.log("Seeding database...");

  console.log("Inserting units...");
  await db.insert(units).values(
    builtInUnits.map((u) => ({ ...u, userId: null }))
  );
  console.log(`Inserted ${builtInUnits.length} units`);

  console.log("Inserting products...");
  await db.insert(products).values(
    globalProducts.map((p) => ({ ...p, userId: null }))
  );
  console.log(`Inserted ${globalProducts.length} products`);

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
