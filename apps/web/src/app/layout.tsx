import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alter — Your Digital Doppelganger",
  description:
    "A living model of you that gets smarter over time. Not an AI assistant you talk to — a version of you that works for you, on your terms.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `
    (() => {
      try {
        const storedTheme = window.localStorage.getItem("alter-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : prefersDark
            ? "dark"
            : "light";
        document.documentElement.classList.toggle("dark", theme === "dark");
      } catch {}
    })();
  `;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <TooltipProvider delayDuration={0}>
          {children}
          <div className="fixed right-4 bottom-4 z-50">
            <ThemeToggle />
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
