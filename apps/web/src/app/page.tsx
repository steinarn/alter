import Link from "next/link";
import { PrismaClient } from "@alter/db";
import {
  Sparkles,
  Eye,
  MessageSquare,
  FileEdit,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const prisma = new PrismaClient();

const FEATURES = [
  {
    icon: Eye,
    title: "Know yourself",
    description:
      "Alter builds a persona card from a natural conversation — your energy drivers, goals, and boundaries.",
  },
  {
    icon: MessageSquare,
    title: "See what matters",
    description:
      "A life dashboard showing your energy forecast, balance scores, and conflict alerts for the week ahead.",
  },
  {
    icon: FileEdit,
    title: "Get smart suggestions",
    description:
      "AI-powered recommendations that align with your goals and respect your energy patterns.",
  },
  {
    icon: Zap,
    title: "Choose your autonomy",
    description:
      "From Observer to Autonomous — decide how much Alter acts on your behalf, separately for personal and professional.",
  },
];

export default async function Home() {
  const user = await prisma.user.findFirst({
    include: { personaCard: true },
  });

  const hasCompletedOnboarding = !!user?.personaCard?.confirmedAt;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Sparkles className="size-12 text-primary" />
        <h1 className="text-5xl font-bold tracking-tight">Alter</h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Your digital doppelganger — a version of you that works for you, on
          your terms.
        </p>
      </div>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="flex gap-3 pt-6">
              <feature.icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        {hasCompletedOnboarding ? (
          <Button asChild size="lg">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/onboarding">
              Get started
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        )}
        {hasCompletedOnboarding && (
          <Button asChild variant="outline" size="lg">
            <Link href="/onboarding">
              Start New Onboarding
            </Link>
          </Button>
        )}
        {hasCompletedOnboarding && (
          <Button asChild variant="outline" size="lg">
            <Link href="/settings">Settings</Link>
          </Button>
        )}
      </div>

      {hasCompletedOnboarding && (
        <p className="max-w-lg text-center text-sm text-muted-foreground">
          Running onboarding again will replace the current persona card with a
          newly generated one.
        </p>
      )}
    </main>
  );
}
