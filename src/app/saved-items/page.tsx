import { PageWrapper } from "@/components/page-wrapper";
import { SavedItemsList } from "./saved-items-list";
import { getSavedItems } from "./actions";

export default async function SavedItemsPage() {
  const items = await getSavedItems();

  return (
    <PageWrapper>
      <SavedItemsList items={items} />
    </PageWrapper>
  );
}
