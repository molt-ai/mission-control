// Calendar utilities for cron job visualization

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr: string;
    tz: string;
  };
  nextRunAtMs: number;
  lastRunAtMs?: number;
  lastStatus?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: Date;
  type: 'cron' | 'task' | 'reminder';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  color: string;
}

// Parse cron expression to human-readable
export function parseCronExpr(expr: string): string {
  const parts = expr.split(' ');
  if (parts.length !== 5) return expr;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Common patterns
  if (minute === '0' && hour.includes('/')) {
    const interval = hour.split('/')[1];
    return `Every ${interval} hours`;
  }
  if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `Daily at ${hour12}:00 ${ampm}`;
  }
  if (dayOfWeek !== '*') {
    return `Weekly on ${dayOfWeek}`;
  }

  return expr;
}

// Get events for a date range
export function getEventsForWeek(jobs: CronJob[], startDate: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  for (const job of jobs) {
    if (!job.enabled) continue;

    // Add next scheduled run
    if (job.nextRunAtMs) {
      const nextRun = new Date(job.nextRunAtMs);
      if (nextRun >= startDate && nextRun <= endDate) {
        events.push({
          id: `${job.id}-next`,
          title: job.name,
          time: nextRun,
          type: 'cron',
          status: 'scheduled',
          color: getJobColor(job.name),
        });
      }
    }

    // Add last completed run
    if (job.lastRunAtMs) {
      const lastRun = new Date(job.lastRunAtMs);
      if (lastRun >= startDate && lastRun <= endDate) {
        events.push({
          id: `${job.id}-last`,
          title: job.name,
          time: lastRun,
          type: 'cron',
          status: job.lastStatus === 'ok' ? 'completed' : 'failed',
          color: getJobColor(job.name),
        });
      }
    }
  }

  return events.sort((a, b) => a.time.getTime() - b.time.getTime());
}

function getJobColor(name: string): string {
  const colors: Record<string, string> = {
    'Morning Brief': 'bg-yellow-500',
    'Afternoon Research Report': 'bg-blue-500',
    'Repo Scout': 'bg-purple-500',
    'Arb Bot Daily Report': 'bg-green-500',
  };
  return colors[name] || 'bg-gray-500';
}

// Get hours grid for daily view
export function getHoursOfDay(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

// Group events by date
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();
  
  for (const event of events) {
    const dateKey = event.time.toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  }
  
  return grouped;
}
