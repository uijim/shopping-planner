import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <Link href="/plan">
        <Button size="lg">Plan a shop</Button>
      </Link>
    </main>
  );
}
