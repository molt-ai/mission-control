'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const outcomeEmoji = {
    success: '✅',
    partial: '⚠️',
    failed: '❌',
  }[task.outcome];

  const typeColors: Record<string, string> = {
    cron: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    direct: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    heartbeat: 'bg-green-500/20 text-green-300 border-green-500/30',
    spawn: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  const time = new Date(task.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Clean trigger for display
  const cleanTrigger = task.trigger
    .replace(/\[message_id: [^\]]+\]/g, '')
    .replace(/\[iMessage [^\]]+\]/g, '')
    .trim();

  return (
    <div
      className={`bg-gray-800/50 border border-gray-700 rounded-xl transition-all cursor-pointer hover:border-gray-600 hover:bg-gray-800 ${
        expanded ? 'ring-2 ring-blue-500/50' : ''
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Collapsed View */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{outcomeEmoji}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[task.type] || typeColors.direct}`}>
                {task.type}
              </span>
              <span className="text-gray-500 text-xs">{time}</span>
            </div>
            <p className="text-gray-200 text-sm line-clamp-2">{task.summary}</p>
          </div>
          <div className="text-gray-500 text-sm">
            {expanded ? '▼' : '▶'}
          </div>
        </div>

        {/* Tools pills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tools.slice(0, 5).map((tool) => (
            <span
              key={tool}
              className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded"
            >
              {tool}
            </span>
          ))}
          {task.tools.length > 5 && (
            <span className="text-xs text-gray-500">+{task.tools.length - 5} more</span>
          )}
        </div>
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="border-t border-gray-700 p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Original Prompt */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Original Prompt
            </h4>
            <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {cleanTrigger || '(no prompt recorded)'}
            </div>
          </div>

          {/* Improved Prompt */}
          {task.improvedPrompt && task.improvedPrompt !== cleanTrigger && (
            <div>
              <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>💡</span> Better Prompt
              </h4>
              <div className="bg-green-950/30 border border-green-800/30 rounded-lg p-3 text-sm text-green-200 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {task.improvedPrompt}
              </div>
              {task.improvementNotes && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  {task.improvementNotes}
                </p>
              )}
            </div>
          )}

          {/* No improvement needed */}
          {(!task.improvedPrompt || task.improvedPrompt === cleanTrigger) && (
            <div className="text-xs text-gray-500 italic">
              ✓ {task.improvementNotes || 'Prompt looks good as-is.'}
            </div>
          )}

          {/* All Tools */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Tools Used ({task.tools.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {task.tools.map((tool) => (
                <span
                  key={tool}
                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Copy Improved Prompt Button */}
          {task.improvedPrompt && task.improvedPrompt !== cleanTrigger && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(task.improvedPrompt!);
              }}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
            >
              📋 Copy Improved Prompt
            </button>
          )}
        </div>
      )}
    </div>
  );
}
