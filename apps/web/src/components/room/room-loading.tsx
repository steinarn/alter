"use client";

export function RoomLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#d0d0d0]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading room...</p>
      </div>
    </div>
  );
}
