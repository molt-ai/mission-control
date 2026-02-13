'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';

interface KanbanBoardProps {
  tasks: Task[];
}

type TaskStatus = 'todo' | 'in-progress' | 'completed';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  emoji: string;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', emoji: '📋', color: 'border-gray-600' },
  { id: 'in-progress', title: 'In Progress', emoji: '🔄', color: 'border-amber-500' },
  { id: 'completed', title: 'Completed', emoji: '✅', color: 'border-emerald-500' },
];

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    'todo': [],
    'in-progress': [],
    'completed': tasks.slice(0, 20),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="bg-gray-900/30 rounded-xl overflow-hidden"
        >
          {/* Column Header */}
          <div className="px-4 py-3 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{column.emoji}</span>
                <h3 className="text-sm font-medium text-gray-300">{column.title}</h3>
              </div>
              <span className="text-xs text-gray-500">
                {tasksByStatus[column.id].length}
              </span>
            </div>
          </div>

          {/* Task Cards */}
          <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
            {tasksByStatus[column.id].length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-6">No tasks</p>
            ) : (
              tasksByStatus[column.id].map((task) => (
                <KanbanCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const typeColors: Record<string, string> = {
    cron: 'text-purple-400',
    direct: 'text-blue-400',
    heartbeat: 'text-emerald-400',
    spawn: 'text-orange-400',
  };

  // Format time only on client to avoid hydration mismatch
  const formatTime = (timestamp: string) => {
    if (!mounted) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const cleanSummary = task.summary
    .replace(/\[cron:[^\]]+\]/g, '')
    .replace(/\[iMessage[^\]]+\]/g, '')
    .trim()
    .slice(0, 80);

  return (
    <div className="bg-gray-800/40 rounded-lg p-3 hover:bg-gray-800/60 transition-colors cursor-pointer border border-gray-700/30">
      <p className="text-sm text-gray-200 leading-relaxed">
        {cleanSummary || 'Task completed'}
      </p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/30">
        <span className={`text-xs font-medium ${typeColors[task.type] || typeColors.direct}`}>
          {task.type}
        </span>
        <span className="text-xs text-gray-500">{formatTime(task.timestamp)}</span>
      </div>
    </div>
  );
}
