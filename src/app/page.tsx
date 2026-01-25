import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignedOut, SignInButton } from "@clerk/nextjs";
import { getOrCreateWeeklyPlan, getRecipesForSelection } from "./plan/actions";
import { MealPlannerGrid } from "./plan/meal-planner-grid";
import { ClearAllButton } from "./plan/clear-all-button";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/page-wrapper";
import { PageHeader } from "@/components/page-header";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Shopping Planner</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Plan your weekly meals and automatically generate shopping lists.
            Sign in to get started.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg">Sign In to Get Started</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </PageWrapper>
    );
  }

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
