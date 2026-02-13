import { promises as fs } from 'fs';
import path from 'path';

export interface Todo {
  id: string;
  project: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export async function getTodos(): Promise<Todo[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'todos.jsonl');
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines.map(line => JSON.parse(line));
  } catch (e) {
    return [];
  }
}

export async function getTodosByProject(project: string): Promise<Todo[]> {
  const todos = await getTodos();
  return todos.filter(t => t.project === project);
}

export async function getProjects(): Promise<string[]> {
  const todos = await getTodos();
  return [...new Set(todos.map(t => t.project))];
}
