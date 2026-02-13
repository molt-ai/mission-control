'use client';

import { useState } from 'react';
import { CronJob, parseCronExpr } from '@/lib/calendar';

interface CronCalendarProps {
  jobs: CronJob[];
}

export function CronCalendar({ jobs }: CronCalendarProps) {
  const [view, setView] = useState<'list' | 'timeline'>('list');

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Sort jobs by next run time
  const sortedJobs = [...jobs]
    .filter(j => j.enabled)
    .sort((a, b) => (a.nextRunAtMs || 0) - (b.nextRunAtMs || 0));

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <h3 className="font-semibold">Scheduled Jobs</h3>
        </div>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 text-xs rounded ${
              view === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`px-3 py-1 text-xs rounded ${
              view === 'timeline' ? 'bg-gray-700 text-white' : 'text-gray-400'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="divide-y divide-gray-800">
          {sortedJobs.map((job) => (
            <JobListItem key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <TimelineView jobs={sortedJobs} />
      )}
    </div>
  );
}

function JobListItem({ job }: { job: CronJob }) {
  const nextRun = job.nextRunAtMs ? new Date(job.nextRunAtMs) : null;
  const lastRun = job.lastRunAtMs ? new Date(job.lastRunAtMs) : null;

  const colors: Record<string, string> = {
    'Morning Brief': 'bg-yellow-500',
    'Afternoon Research Report': 'bg-blue-500',
    'Repo Scout': 'bg-purple-500',
    'Arb Bot Daily Report': 'bg-green-500',
  };

  const color = colors[job.name] || 'bg-gray-500';

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 0) {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    return date.toLocaleString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-200">{job.name}</h4>
            {nextRun && (
              <span className="text-sm text-gray-400">{formatTime(nextRun)}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">
              {parseCronExpr(job.schedule.expr)}
            </span>
            {lastRun && (
              <span className="text-xs text-gray-600">
                Last: {lastRun.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {job.lastStatus === 'ok' ? ' ✓' : ' ✗'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineView({ jobs }: { jobs: CronJob[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const now = new Date();
  const currentHour = now.getHours();

  // Map jobs to their scheduled hours
  const jobsByHour: Record<number, CronJob[]> = {};
  for (const job of jobs) {
    const expr = job.schedule.expr;
    const parts = expr.split(' ');
    if (parts.length === 5) {
      const hour = parts[1];
      if (hour !== '*' && !hour.includes('/')) {
        const h = parseInt(hour);
        if (!jobsByHour[h]) jobsByHour[h] = [];
        jobsByHour[h].push(job);
      } else if (hour.includes('/')) {
        // Every N hours
        const interval = parseInt(hour.split('/')[1]);
        for (let h = 0; h < 24; h += interval) {
          if (!jobsByHour[h]) jobsByHour[h] = [];
          jobsByHour[h].push(job);
        }
      }
    }
  }

  const colors: Record<string, string> = {
    'Morning Brief': 'bg-yellow-500',
    'Afternoon Research Report': 'bg-blue-500',
    'Repo Scout': 'bg-purple-500',
    'Arb Bot Daily Report': 'bg-green-500',
  };

  return (
    <div className="p-4">
      <div className="relative">
        {/* Hours grid */}
        <div className="space-y-1">
          {hours.map((hour) => {
            const isPast = hour < currentHour;
            const isCurrent = hour === currentHour;
            const jobsAtHour = jobsByHour[hour] || [];

            return (
              <div
                key={hour}
                className={`flex items-center gap-3 py-1 ${
                  isPast ? 'opacity-40' : ''
                } ${isCurrent ? 'bg-blue-500/10 -mx-4 px-4 rounded' : ''}`}
              >
                <span className="text-xs text-gray-500 w-12 text-right font-mono">
                  {hour.toString().padStart(2, '0')}:00
                </span>
                <div className="flex-1 flex gap-1">
                  {jobsAtHour.map((job) => (
                    <div
                      key={job.id}
                      className={`${colors[job.name] || 'bg-gray-500'} px-2 py-0.5 rounded text-xs text-white truncate max-w-32`}
                      title={job.name}
                    >
                      {job.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
