import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Sparkles className="size-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Alter</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Your digital doppelganger — a version of you that works for you, on
          your terms.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/onboarding">Get started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
