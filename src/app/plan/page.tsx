import { getOrCreateWeeklyPlan, getRecipesForSelection } from "./actions";
import { MealPlannerGrid } from "./meal-planner-grid";

export default async function PlanPage() {
  const [weeklyPlan, recipes] = await Promise.all([
    getOrCreateWeeklyPlan(),
    getRecipesForSelection(),
  ]);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <h1 className="mb-6 text-2xl font-bold">Meal Planner</h1>
      <p className="mb-8 text-muted-foreground">
        Plan your meals for the week, then generate a shopping list.
      </p>

      <MealPlannerGrid
        weeklyPlanId={weeklyPlan.id}
        mealSlots={weeklyPlan.mealSlots}
        recipes={recipes}
      />
    </main>
  );
}
