"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  Menu,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/suggestions", label: "Suggestions", icon: Lightbulb },
  { href: "/room", label: "Room", icon: Box },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          <span>{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="lg:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Link href="/" className="flex items-center gap-2 px-3 py-2">
        <Sparkles className="size-5 text-primary" />
        <span className="text-lg font-bold tracking-tight">Alter</span>
      </Link>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname === item.href}
          />
        ))}
      </nav>
      <Separator />
      <div className="px-3 py-2 text-xs text-muted-foreground">
        MVP — single-user demo
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileNav() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <span className="font-bold">Alter</span>
      </Link>
    </header>
  );
}
