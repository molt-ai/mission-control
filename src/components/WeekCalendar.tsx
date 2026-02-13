'use client';

import { useState, useEffect } from 'react';
import { CronJob } from '@/lib/calendar';

interface WeekCalendarProps {
  jobs: CronJob[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const JOB_COLORS: Record<string, string> = {
  'Morning Brief': 'bg-orange-500/70',
  'Afternoon Research Report': 'bg-blue-500/70',
  'Repo Scout': 'bg-purple-500/70',
  'Arb Bot Daily Report': 'bg-emerald-500/70',
};

export function WeekCalendar({ jobs }: WeekCalendarProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
  }, []);

  const today = now ? now.getDay() : -1;

  // Get week dates (only computed client-side)
  const getWeekDates = () => {
    if (!now) return Array(7).fill(null);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const getJobDays = (job: CronJob): number[] => {
    const expr = job.schedule.expr;
    const parts = expr.split(' ');
    if (parts.length !== 5) return [];
    const dayOfWeek = parts[4];
    if (dayOfWeek === '*') return [0, 1, 2, 3, 4, 5, 6];
    if (dayOfWeek.includes(',')) return dayOfWeek.split(',').map(d => parseInt(d));
    if (!isNaN(parseInt(dayOfWeek))) return [parseInt(dayOfWeek)];
    return [0, 1, 2, 3, 4, 5, 6];
  };

  const getJobTime = (job: CronJob): string => {
    const expr = job.schedule.expr;
    const parts = expr.split(' ');
    if (parts.length !== 5) return '';
    const minute = parts[0];
    const hour = parts[1];
    if (hour.includes('/')) return `Every ${hour.split('/')[1]}h`;
    if (hour !== '*') {
      const h = parseInt(hour);
      const ampm = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${minute.padStart(2, '0')} ${ampm}`;
    }
    return '';
  };

  // Group jobs by day
  const jobsByDay: Record<number, { job: CronJob; time: string }[]> = {};
  for (let i = 0; i < 7; i++) jobsByDay[i] = [];
  for (const job of jobs) {
    if (!job.enabled) continue;
    const days = getJobDays(job);
    const time = getJobTime(job);
    for (const day of days) jobsByDay[day].push({ job, time });
  }

  const recurringJobs = jobs.filter(j => j.enabled && j.schedule.expr.includes('/'));

  return (
    <div className="bg-gray-900/30 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800/50 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-300">Schedule</h2>
      </div>

      {/* Recurring jobs */}
      {recurringJobs.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-800/30 flex flex-wrap gap-2">
          {recurringJobs.map(job => (
            <span
              key={job.id}
              className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-400"
            >
              {job.name} • {getJobTime(job)}
            </span>
          ))}
        </div>
      )}

      {/* Week Grid */}
      <div className="grid grid-cols-7">
        {/* Day Headers */}
        {DAYS.map((day, i) => (
          <div
            key={day}
            className={`py-2 text-center border-b border-gray-800/30 ${
              mounted && i === today ? 'bg-purple-600/10' : ''
            }`}
          >
            <p className={`text-xs ${mounted && i === today ? 'text-purple-400' : 'text-gray-500'}`}>
              {day}
            </p>
            <p className={`text-sm font-medium ${mounted && i === today ? 'text-purple-400' : 'text-gray-400'}`}>
              {mounted && weekDates[i] ? weekDates[i]!.getDate() : '-'}
            </p>
          </div>
        ))}

        {/* Day Content */}
        {DAYS.map((_, dayIndex) => (
          <div
            key={dayIndex}
            className={`min-h-24 p-1.5 space-y-1 border-r border-gray-800/20 last:border-r-0 ${
              mounted && dayIndex === today ? 'bg-purple-600/5' : ''
            }`}
          >
            {jobsByDay[dayIndex]
              .filter(({ job }) => !job.schedule.expr.includes('/'))
              .sort((a, b) => {
                const timeA = a.time.includes('AM') ? 0 : 12;
                const timeB = b.time.includes('AM') ? 0 : 12;
                return timeA - timeB;
              })
              .map(({ job, time }) => (
                <div
                  key={job.id}
                  className={`${JOB_COLORS[job.name] || 'bg-gray-600/70'} rounded px-1.5 py-1`}
                >
                  <p className="text-[10px] text-white/70">{time}</p>
                  <p className="text-[10px] text-white font-medium truncate">{job.name}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
