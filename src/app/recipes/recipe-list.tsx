"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditRecipeDialog } from "./edit-recipe-dialog";
import type { Product } from "@/db/schema";

interface RecipeWithIngredients {
  id: string;
  name: string;
  description: string | null;
  servings: number;
  recipeProducts: {
    productId: string;
    quantity: number;
    unit: string;
    product: {
      id: string;
      name: string;
    };
  }[];
}

interface RecipeListProps {
  recipes: RecipeWithIngredients[];
  products: Product[];
}

export function RecipeList({ recipes, products }: RecipeListProps) {
  const [selectedRecipe, setSelectedRecipe] =
    useState<RecipeWithIngredients | null>(null);

  if (recipes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mb-2 text-lg text-muted-foreground">
          You don&apos;t have any recipes yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Click &quot;Add Recipe&quot; to create your first recipe.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {recipe.description && (
                <p className="mb-2 text-sm text-muted-foreground">
                  {recipe.description}
                </p>
              )}
              <p className="text-sm">
                <span className="font-medium">{recipe.servings}</span> servings
              </p>
              <p className="text-sm">
                <span className="font-medium">
                  {recipe.recipeProducts.length}
                </span>{" "}
                ingredients
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRecipe && (
        <EditRecipeDialog
          recipe={selectedRecipe}
          products={products}
          open={!!selectedRecipe}
          onOpenChange={(open) => {
            if (!open) setSelectedRecipe(null);
          }}
        />
      )}
    </>
  );
}
