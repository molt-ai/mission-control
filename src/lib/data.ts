import { promises as fs } from 'fs';
import path from 'path';
import { Task, SessionHealth, DashboardStats } from './types';
import { improveTasks } from './prompt-improver';

const DATA_DIR = path.join(process.cwd(), 'data');

async function readJsonl<T>(filename: string): Promise<T[]> {
  const filepath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  } catch (error) {
    return [];
  }
}

export async function getTasks(): Promise<Task[]> {
  const tasks = await readJsonl<Task>('tasks.jsonl');
  // Add prompt improvements to each task
  return improveTasks(tasks);
}

export async function getSessions(): Promise<SessionHealth[]> {
  return readJsonl<SessionHealth>('sessions.jsonl');
}

export async function getStats(): Promise<DashboardStats> {
  const tasks = await readJsonl<Task>('tasks.jsonl');
  const sessions = await getSessions();

  const successfulTasks = tasks.filter(t => t.outcome === 'success').length;
  const successRate = tasks.length > 0 ? (successfulTasks / tasks.length) * 100 : 0;

  // Calculate tasks per day
  const uniqueDays = new Set(tasks.map(t => t.timestamp.split('T')[0]));
  const avgTasksPerDay = uniqueDays.size > 0 ? tasks.length / uniqueDays.size : 0;

  // Count trigger types
  const triggerCounts: Record<string, number> = {};
  tasks.forEach(t => {
    triggerCounts[t.type] = (triggerCounts[t.type] || 0) + 1;
  });
  const topTriggerTypes = Object.entries(triggerCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Count tools
  const toolCounts: Record<string, number> = {};
  tasks.forEach(t => {
    t.tools.forEach(tool => {
      toolCounts[tool] = (toolCounts[tool] || 0) + 1;
    });
  });
  const topTools = Object.entries(toolCounts)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Get most recent session health
  const recentHealth = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  return {
    totalTasks: tasks.length,
    successRate,
    avgTasksPerDay,
    topTriggerTypes,
    topTools,
    recentHealth,
  };
}

export async function getRecentTasks(limit = 50): Promise<Task[]> {
  const tasks = await getTasks();
  return tasks.slice(-limit).reverse();
}

export async function getTaskById(id: string): Promise<Task | null> {
  const tasks = await getTasks();
  return tasks.find(t => t.id === id) || null;
}
