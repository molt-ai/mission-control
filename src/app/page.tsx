import { getStats, getTasks } from '@/lib/data';
import { getGitHubRepos } from '@/lib/github';
import { GitHubRepo } from '@/lib/types';
import { Task } from '@/lib/types';
import Link from 'next/link';
import { RepoList } from '@/components/RepoList';

export const dynamic = 'force-dynamic';

// Match tasks to repos by looking for repo name in task summary/trigger
function matchTasksToRepos(repos: GitHubRepo[], tasks: Task[]): Record<string, Task[]> {
  const repoTasks: Record<string, Task[]> = {};
  
  for (const repo of repos) {
    const repoName = repo.name.toLowerCase();
    const matched = tasks.filter(task => {
      const text = `${task.summary} ${task.trigger}`.toLowerCase();
      return text.includes(repoName) || 
             text.includes(repoName.replace(/-/g, ' ')) ||
             text.includes(repoName.replace(/-/g, ''));
    });
    repoTasks[repo.name] = matched;
  }
  
  return repoTasks;
}

export default async function Dashboard() {
  const stats = await getStats();
  const tasks = await getTasks();
  const repos = await getGitHubRepos();
  const repoTasks = matchTasksToRepos(repos, tasks);

  // Calculate unmatched tasks
  const matchedTaskIds = new Set<string>();
  Object.values(repoTasks).forEach(taskList => taskList.forEach(t => matchedTaskIds.add(t.id)));
  const unmatchedTasks = tasks.filter(t => !matchedTaskIds.has(t.id));

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800/50 sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-semibold">Molt</span>
          </div>
          <Link 
            href="/mission"
            className="px-3 py-1.5 bg-purple-600/80 text-white rounded-lg text-sm"
          >
            Schedule →
          </Link>
        </div>
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Quick Stats */}
        <div className="flex gap-3 mb-6">
          <StatPill label="Tasks" value={stats.totalTasks} />
          <StatPill label="Repos" value={repos.length} />
          <StatPill label="Success" value={`${stats.successRate.toFixed(0)}%`} />
        </div>

        {/* Repos with Tasks */}
        <RepoList repos={repos} repoTasks={repoTasks} unmatchedTasks={unmatchedTasks} />
      </div>
    </main>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 text-center bg-gray-900/30 py-3 rounded-lg">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
