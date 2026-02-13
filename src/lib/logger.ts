// Logger for Molt to record tasks
// Usage: Call logTask() after completing significant work

import { promises as fs } from 'fs';
import path from 'path';
import { Task } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function logTask(task: Omit<Task, 'id' | 'timestamp'>): Promise<Task> {
  const fullTask: Task = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...task,
  };

  const line = JSON.stringify(fullTask) + '\n';
  await fs.appendFile(path.join(DATA_DIR, 'tasks.jsonl'), line);

  return fullTask;
}

export async function logPromptAnalysis(analysis: any): Promise<void> {
  const fullAnalysis = {
    id: `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...analysis,
  };

  const line = JSON.stringify(fullAnalysis) + '\n';
  await fs.appendFile(path.join(DATA_DIR, 'prompts.jsonl'), line);
}

export async function logSessionHealth(health: any): Promise<void> {
  const line = JSON.stringify(health) + '\n';
  await fs.appendFile(path.join(DATA_DIR, 'sessions.jsonl'), line);
}
