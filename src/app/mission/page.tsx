import { getTasks } from '@/lib/data';
import { KanbanBoard } from '@/components/KanbanBoard';
import { WeekCalendar } from '@/components/WeekCalendar';
import { NextUp } from '@/components/NextUp';
import { CronJob } from '@/lib/calendar';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getCronJobs(): Promise<CronJob[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'cron-jobs.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data.jobs || [];
  } catch (e) {
    console.error('Failed to fetch cron jobs:', e);
    return [];
  }
}

export default async function MissionControl() {
  const tasks = await getTasks();
  const cronJobs = await getCronJobs();
  const recentTasks = tasks.slice(-50).reverse();
  const activeJobs = cronJobs.filter(j => j.enabled).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Tasks</h1>
          <p className="text-sm text-gray-500">Monitor Molt's work</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-gray-400">Online</span>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-200">{activeJobs}</p>
              <p className="text-xs text-gray-500">Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-200">{tasks.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <WeekCalendar jobs={cronJobs} />
        </div>
        <div>
          <NextUp jobs={cronJobs} />
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-300">Recent Tasks</h2>
          <span className="text-xs text-gray-500">{recentTasks.length} tasks</span>
        </div>
        <KanbanBoard tasks={recentTasks} />
      </div>
    </div>
  );
}
