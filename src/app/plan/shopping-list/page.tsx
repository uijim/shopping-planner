import {
  getOrCreateWeeklyPlan,
  getShoppingListForPlan,
  getCustomItemsForPlan,
} from "../actions";
import { ShoppingListContent } from "./shopping-list-content";

export default async function ShoppingListPage() {
  const weeklyPlan = await getOrCreateWeeklyPlan();
  const [{ items, weekStartDate }, customItems] = await Promise.all([
    getShoppingListForPlan(weeklyPlan.id),
    getCustomItemsForPlan(weeklyPlan.id),
  ]);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <ShoppingListContent
        items={items}
        customItems={customItems}
        weekStartDate={weekStartDate}
        weeklyPlanId={weeklyPlan.id}
      />
    </main>
  );
}
