import {
  getOrCreateWeeklyPlan,
  getShoppingListForPlan,
  getCustomItemsForPlan,
} from "../actions";
import { getSavedItems } from "@/app/saved-items/actions";
import { ShoppingListContent } from "./shopping-list-content";
import { PageWrapper } from "@/components/page-wrapper";

export default async function ShoppingListPage() {
  const weeklyPlan = await getOrCreateWeeklyPlan();
  const [{ items, weekStartDate }, customItems, savedItems] = await Promise.all([
    getShoppingListForPlan(weeklyPlan.id),
    getCustomItemsForPlan(weeklyPlan.id),
    getSavedItems(),
  ]);

  return (
    <PageWrapper>
      <ShoppingListContent
        items={items}
        customItems={customItems}
        savedItems={savedItems}
        weekStartDate={weekStartDate}
        weeklyPlanId={weeklyPlan.id}
      />
    </PageWrapper>
  );
}
