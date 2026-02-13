// Project extraction and grouping logic

import { Task } from './types';

export interface Project {
  id: string;
  name: string;
  emoji: string;
  description: string;
  taskCount: number;
  lastActivity: string;
  tasks: Task[];
}

// Known projects with metadata
const PROJECT_PATTERNS: Record<string, { name: string; emoji: string; description: string; patterns: RegExp[] }> = {
  'morning-brief': {
    name: 'Morning Brief',
    emoji: '☀️',
    description: 'Daily morning updates with weather, calendar, and news',
    patterns: [/Morning Brief/i, /morning brief/i],
  },
  'afternoon-research': {
    name: 'Afternoon Research',
    emoji: '📚',
    description: 'Daily research reports on rotating topics',
    patterns: [/Afternoon Research/i, /Research Report/i],
  },
  'repo-scout': {
    name: 'Repo Scout',
    emoji: '🔍',
    description: 'Finding acquisition-worthy project ideas',
    patterns: [/Repo Scout/i],
  },
  'arb-bot': {
    name: 'Arb Bot',
    emoji: '📊',
    description: 'Arbitrage opportunity scanning and reporting',
    patterns: [/Arb Bot/i, /Arbitrage/i, /arb-bot/i],
  },
  'direct-chat': {
    name: 'Direct Chat',
    emoji: '💬',
    description: 'Direct conversations and ad-hoc tasks',
    patterns: [/iMessage/i, /^\[Queued/],
  },
  'dashboard': {
    name: 'Dashboard',
    emoji: '🎯',
    description: 'Building and maintaining this dashboard',
    patterns: [/dashboard/i, /clawd-dashboard/i],
  },
};

export function extractProjectId(task: Task): string {
  const trigger = task.trigger || '';
  const summary = task.summary || '';
  const combined = `${trigger} ${summary}`;

  for (const [id, config] of Object.entries(PROJECT_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(combined)) {
        return id;
      }
    }
  }

  return 'other';
}

export function groupTasksByProject(tasks: Task[]): Project[] {
  const groups: Record<string, Task[]> = {};

  // Group tasks by project
  for (const task of tasks) {
    const projectId = extractProjectId(task);
    if (!groups[projectId]) {
      groups[projectId] = [];
    }
    groups[projectId].push(task);
  }

  // Convert to Project objects
  const projects: Project[] = [];

  for (const [id, projectTasks] of Object.entries(groups)) {
    const config = PROJECT_PATTERNS[id] || {
      name: 'Other Tasks',
      emoji: '📦',
      description: 'Miscellaneous tasks',
    };

    // Sort tasks by timestamp descending
    projectTasks.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    projects.push({
      id,
      name: config.name,
      emoji: config.emoji,
      description: config.description,
      taskCount: projectTasks.length,
      lastActivity: projectTasks[0]?.timestamp || '',
      tasks: projectTasks,
    });
  }

  // Sort projects by last activity
  projects.sort((a, b) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  return projects;
}

export function getProjectStats(projects: Project[]): {
  totalProjects: number;
  mostActiveProject: string;
  tasksByProject: { name: string; count: number }[];
} {
  const tasksByProject = projects.map(p => ({
    name: `${p.emoji} ${p.name}`,
    count: p.taskCount,
  })).sort((a, b) => b.count - a.count);

  return {
    totalProjects: projects.length,
    mostActiveProject: tasksByProject[0]?.name || 'None',
    tasksByProject,
  };
}
