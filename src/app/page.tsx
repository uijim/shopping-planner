import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getOrCreateWeeklyPlan, getRecipesForSelection } from "./plan/actions";
import { MealPlannerGrid } from "./plan/meal-planner-grid";
import { ClearAllButton } from "./plan/clear-all-button";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/page-wrapper";
import { PageHeader } from "@/components/page-header";

export default async function Home() {
  const [weeklyPlan, recipes] = await Promise.all([
    getOrCreateWeeklyPlan(),
    getRecipesForSelection(),
  ]);

  const hasMeals = weeklyPlan.mealSlots.length > 0;

  return (
    <PageWrapper>
      <PageHeader>
        <h1 className="text-2xl font-bold">Meal Planner</h1>
        <div className="flex gap-2">
          <ClearAllButton weeklyPlanId={weeklyPlan.id} disabled={!hasMeals} />
          <Link href="/plan/shopping-list">
            <Button disabled={!hasMeals}>
              <ShoppingCart className="mr-1 h-4 w-4" />
              Generate Shopping List
            </Button>
          </Link>
        </div>
      </PageHeader>
      <p className="mb-8 text-muted-foreground">
        Plan your meals for the week, then generate a shopping list.
      </p>

      <MealPlannerGrid
        weeklyPlanId={weeklyPlan.id}
        mealSlots={weeklyPlan.mealSlots}
        recipes={recipes}
      />
    </PageWrapper>
  );
}
