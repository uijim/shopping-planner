import { getOrCreateWeeklyPlan, getShoppingListForPlan } from "../actions";
import { ShoppingListContent } from "./shopping-list-content";

export default async function ShoppingListPage() {
  const weeklyPlan = await getOrCreateWeeklyPlan();
  const { items, weekStartDate } = await getShoppingListForPlan(weeklyPlan.id);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <ShoppingListContent items={items} weekStartDate={weekStartDate} />
    </main>
  );
}
