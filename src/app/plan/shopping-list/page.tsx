import {
  getOrCreateWeeklyPlan,
  getShoppingListForPlan,
  getCustomItemsForPlan,
} from "../actions";
import { ShoppingListContent } from "./shopping-list-content";
import { PageWrapper } from "@/components/page-wrapper";

export default async function ShoppingListPage() {
  const weeklyPlan = await getOrCreateWeeklyPlan();
  const [{ items, weekStartDate }, customItems] = await Promise.all([
    getShoppingListForPlan(weeklyPlan.id),
    getCustomItemsForPlan(weeklyPlan.id),
  ]);

  return (
    <PageWrapper>
      <ShoppingListContent
        items={items}
        customItems={customItems}
        weekStartDate={weekStartDate}
        weeklyPlanId={weeklyPlan.id}
      />
    </PageWrapper>
  );
}
