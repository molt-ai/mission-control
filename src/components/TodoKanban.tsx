'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/lib/todos';

interface TodoKanbanProps {
  todos: Todo[];
  projectName: string;
}

const columns = [
  { id: 'todo', title: 'To Do', emoji: '📋' },
  { id: 'in-progress', title: 'In Progress', emoji: '🔄' },
  { id: 'done', title: 'Done', emoji: '✅' },
] as const;

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-gray-500',
};

export function TodoKanban({ todos, projectName }: TodoKanbanProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const todosByStatus = {
    'todo': todos.filter(t => t.status === 'todo'),
    'in-progress': todos.filter(t => t.status === 'in-progress'),
    'done': todos.filter(t => t.status === 'done'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-300">
          {projectName}
        </h2>
        <span className="text-xs text-gray-500">{todos.length} items</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {columns.map((col) => (
          <div key={col.id} className="bg-gray-900/30 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-800/50">
              <div className="flex items-center gap-2">
                <span className="text-sm">{col.emoji}</span>
                <span className="text-xs font-medium text-gray-400">{col.title}</span>
                <span className="text-xs text-gray-600 ml-auto">
                  {todosByStatus[col.id].length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[120px]">
              {todosByStatus[col.id].map((todo) => (
                <TodoCard key={todo.id} todo={todo} mounted={mounted} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodoCard({ todo, mounted }: { todo: Todo; mounted: boolean }) {
  const timeAgo = mounted ? getTimeAgo(new Date(todo.updatedAt)) : '';
  
  return (
    <div className={`bg-gray-800/40 rounded-lg p-2.5 border-l-2 ${priorityColors[todo.priority]}`}>
      <p className="text-sm text-gray-200 leading-snug">{todo.title}</p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${
          todo.priority === 'high' ? 'text-red-400' :
          todo.priority === 'medium' ? 'text-amber-400' : 'text-gray-500'
        }`}>
          {todo.priority}
        </span>
        <span className="text-xs text-gray-500">{timeAgo}</span>
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
