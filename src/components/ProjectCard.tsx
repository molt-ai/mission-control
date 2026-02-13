'use client';

import { useState } from 'react';
import { Project } from '@/lib/projects';
import { TaskCard } from './TaskCard';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const lastActivityDate = new Date(project.lastActivity);
  const timeAgo = getTimeAgo(lastActivityDate);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* Project Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{project.emoji}</span>
            <div>
              <h3 className="font-semibold text-gray-100">{project.name}</h3>
              <p className="text-xs text-gray-500">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold text-gray-200">{project.taskCount}</p>
              <p className="text-xs text-gray-500">tasks</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-400">{timeAgo}</p>
              <p className="text-xs text-gray-500">last activity</p>
            </div>
            <div className="text-gray-500">
              {expanded ? '▼' : '▶'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Task List */}
      {expanded && (
        <div className="border-t border-gray-800 p-4 bg-gray-950/50">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {project.tasks.slice(0, 20).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {project.tasks.length > 20 && (
              <p className="text-center text-gray-500 text-sm py-2">
                + {project.tasks.length - 20} more tasks
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
