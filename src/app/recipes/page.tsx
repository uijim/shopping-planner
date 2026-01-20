import { getRecipes, getProducts } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddRecipeDialog } from "./add-recipe-dialog";

export default async function RecipesPage() {
  const [recipes, products] = await Promise.all([getRecipes(), getProducts()]);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <AddRecipeDialog products={products} />
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="mb-2 text-lg text-muted-foreground">
            You don&apos;t have any recipes yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Click &quot;Add Recipe&quot; to create your first recipe.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
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
      )}
    </main>
  );
}
