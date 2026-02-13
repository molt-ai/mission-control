'use client';

import { useState, useEffect } from 'react';
import { GitHubRepo } from '@/lib/types';

function getLanguageEmoji(language: string | null): string {
  const langEmojis: Record<string, string> = {
    'TypeScript': '🔷',
    'JavaScript': '🟨',
    'Python': '🐍',
    'Go': '🔵',
    'Rust': '🦀',
    'Shell': '🐚',
    'HTML': '🌐',
    'CSS': '🎨',
  };
  return langEmojis[language || ''] || '📄';
}
import { Task } from '@/lib/types';

interface RepoListProps {
  repos: GitHubRepo[];
  repoTasks: Record<string, Task[]>;
  unmatchedTasks: Task[];
}

export function RepoList({ repos, repoTasks, unmatchedTasks }: RepoListProps) {
  return (
    <div className="space-y-2">
      {repos.map((repo) => (
        <RepoRow 
          key={repo.name} 
          repo={repo} 
          tasks={repoTasks[repo.name] || []} 
        />
      ))}
      
      {unmatchedTasks.length > 0 && (
        <RepoRow
          repo={{
            name: 'Other Tasks',
            description: 'Tasks not linked to a specific repo',
            url: '',
            updatedAt: unmatchedTasks[0]?.timestamp || '',
            language: null,
            stars: 0,
            isPrivate: false,
          }}
          tasks={unmatchedTasks}
          isOther
        />
      )}
    </div>
  );
}

function RepoRow({ repo, tasks, isOther = false }: { repo: GitHubRepo; tasks: Task[]; isOther?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  const timeAgo = mounted ? getTimeAgo(new Date(repo.updatedAt)) : '';
  const emoji = isOther ? '📦' : getLanguageEmoji(repo.language);
  const taskCount = tasks.length;

  return (
    <div className="bg-gray-900/30 rounded-lg overflow-hidden">
      <div 
        className="flex items-center gap-3 p-3 active:bg-gray-800/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-lg">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-200 truncate">{repo.name}</p>
            {repo.isPrivate && <span className="text-xs text-gray-600">🔒</span>}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {repo.description || repo.language || 'No description'}
          </p>
        </div>
        <div className="text-right flex items-center gap-2">
          {taskCount > 0 && (
            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">
              {taskCount}
            </span>
          )}
          <span className="text-xs text-gray-500">{timeAgo}</span>
          <span className="text-gray-600 text-xs">{expanded ? '▼' : '›'}</span>
        </div>
      </div>

      {/* Expanded Tasks */}
      {expanded && (
        <div className="border-t border-gray-800/50 bg-gray-950/50">
          {!isOther && repo.url && (
            <a 
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-xs text-purple-400 hover:text-purple-300"
            >
              Open on GitHub →
            </a>
          )}
          
          {taskCount === 0 ? (
            <p className="px-4 py-4 text-xs text-gray-500 text-center">No tasks yet</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {tasks.slice(0, 15).map((task) => (
                <TaskRow key={task.id} task={task} mounted={mounted} />
              ))}
              {taskCount > 15 && (
                <p className="px-4 py-2 text-xs text-gray-500 text-center">
                  +{taskCount - 15} more
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, mounted }: { task: Task; mounted: boolean }) {
  const timeAgo = mounted ? getTimeAgo(new Date(task.timestamp)) : '';
  const outcomeColors = {
    success: 'text-emerald-400',
    partial: 'text-amber-400',
    failed: 'text-red-400',
  };

  // Clean summary
  const summary = task.summary
    .replace(/\[cron:[^\]]+\]/g, '')
    .replace(/\[iMessage[^\]]+\]/g, '')
    .replace(/\[Queued[^\]]+\]/g, '')
    .trim()
    .slice(0, 80);

  return (
    <div className="px-4 py-2 border-b border-gray-800/30 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-300 flex-1">{summary || 'Task completed'}</p>
        <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-xs ${outcomeColors[task.outcome]}`}>
          {task.outcome === 'success' ? '✓' : task.outcome === 'partial' ? '◐' : '✗'}
        </span>
        {task.tools.slice(0, 3).map((tool) => (
          <span key={tool} className="text-xs text-gray-600">{tool}</span>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return 'now';
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}
