import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isDrainer: boolean;
  isBooster: boolean;
}

interface DayGroup {
  date: string;
  dayLabel: string;
  events: CalendarEvent[];
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function groupByDay(events: CalendarEvent[]): DayGroup[] {
  const map = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const date = new Date(event.startTime).toISOString().split("T")[0];
    const existing = map.get(date) ?? [];
    existing.push(event);
    map.set(date, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, evts]) => ({
      date,
      dayLabel: new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      events: evts.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    }));
}

export function CalendarPreview({
  events,
}: {
  events: CalendarEvent[];
}) {
  const days = groupByDay(events);

  if (days.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Week at a Glance</CardTitle>
          <CardDescription>No events scheduled this week</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Week at a Glance</CardTitle>
        <CardDescription>Upcoming events tagged by energy impact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day.date}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {day.dayLabel}
              </p>
              <div className="space-y-1">
                {day.events.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
                      event.isDrainer && "bg-red-50 text-red-700",
                      event.isBooster && "bg-emerald-50 text-emerald-700",
                      !event.isDrainer &&
                        !event.isBooster &&
                        "bg-muted text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        event.isDrainer && "bg-red-500",
                        event.isBooster && "bg-emerald-500",
                        !event.isDrainer &&
                          !event.isBooster &&
                          "bg-muted-foreground"
                      )}
                    />
                    <span className="flex-1 truncate">{event.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTime(event.startTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
