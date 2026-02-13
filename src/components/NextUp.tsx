'use client';

import { useEffect, useState } from 'react';
import { CronJob } from '@/lib/calendar';

interface NextUpProps {
  jobs: CronJob[];
}

const JOB_COLORS: Record<string, string> = {
  'Morning Brief': 'border-l-orange-500',
  'Afternoon Research Report': 'border-l-blue-500',
  'Repo Scout': 'border-l-purple-500',
  'Arb Bot Daily Report': 'border-l-emerald-500',
};

export function NextUp({ jobs }: NextUpProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const upcomingJobs = [...jobs]
    .filter(j => j.enabled && j.nextRunAtMs)
    .sort((a, b) => (a.nextRunAtMs || 0) - (b.nextRunAtMs || 0))
    .slice(0, 5);

  const formatTimeUntil = (ms: number): string => {
    if (!mounted) return '';
    const diff = ms - now.getTime();
    if (diff < 0) return 'Running...';

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const formatNextRun = (ms: number): string => {
    if (!mounted) return '';
    const date = new Date(ms);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${days[date.getDay()]} ${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="bg-gray-900/30 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800/50">
        <h2 className="text-sm font-medium text-gray-300">Next Up</h2>
      </div>

      <div className="divide-y divide-gray-800/30">
        {upcomingJobs.map((job) => (
          <div
            key={job.id}
            className={`px-4 py-3 border-l-2 ${JOB_COLORS[job.name] || 'border-l-gray-600'} hover:bg-gray-800/30 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200">{job.name}</p>
                <p className="text-xs text-gray-500">
                  {job.nextRunAtMs && formatNextRun(job.nextRunAtMs)}
                </p>
              </div>
              <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                {job.nextRunAtMs && formatTimeUntil(job.nextRunAtMs)}
              </span>
            </div>
          </div>
        ))}

        {upcomingJobs.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-600 text-sm">
            No upcoming tasks
          </div>
        )}
      </div>
    </div>
  );
}
