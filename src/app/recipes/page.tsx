import { getRecipes, getProducts } from "./actions";
import { AddRecipeDialog } from "./add-recipe-dialog";
import { RecipeList } from "./recipe-list";
import { PageWrapper } from "@/components/page-wrapper";

export default async function RecipesPage() {
  const [recipes, products] = await Promise.all([getRecipes(), getProducts()]);

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <AddRecipeDialog products={products} />
      </div>

      <RecipeList recipes={recipes} products={products} />
    </PageWrapper>
  );
}
