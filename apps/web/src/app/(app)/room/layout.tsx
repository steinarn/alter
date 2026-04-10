import Link from "next/link";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-screen">
      {children}
      <Link
        href="/dashboard"
        className="fixed left-4 top-4 z-50 rounded-lg bg-white/80 px-4 py-2 text-sm font-medium shadow-md backdrop-blur-sm transition-colors hover:bg-white"
      >
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}
