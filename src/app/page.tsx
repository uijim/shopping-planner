import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/page-wrapper";

export default function Home() {
  return (
    <PageWrapper centered>
      <Link href="/plan">
        <Button size="lg">Plan a shop</Button>
      </Link>
    </PageWrapper>
  );
}
