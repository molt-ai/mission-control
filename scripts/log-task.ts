#!/usr/bin/env npx ts-node

// CLI script for logging tasks
// Usage: npx ts-node scripts/log-task.ts --type direct --summary "Did the thing" --outcome success --tools "exec,write"

import { promises as fs } from 'fs';
import path from 'path';

interface Task {
  id: string;
  timestamp: string;
  type: 'cron' | 'direct' | 'heartbeat' | 'spawn';
  trigger: string;
  summary: string;
  outcome: 'success' | 'partial' | 'failed';
  durationMs?: number;
  tools: string[];
  sessionKey?: string;
}

async function main() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    parsed[key] = value;
  }

  const task: Task = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    type: (parsed.type as Task['type']) || 'direct',
    trigger: parsed.trigger || 'manual',
    summary: parsed.summary || 'Task completed',
    outcome: (parsed.outcome as Task['outcome']) || 'success',
    tools: parsed.tools ? parsed.tools.split(',') : [],
    sessionKey: parsed.session,
  };

  if (parsed.duration) {
    task.durationMs = parseInt(parsed.duration, 10);
  }

  const dataDir = path.join(__dirname, '..', 'data');
  const line = JSON.stringify(task) + '\n';
  await fs.appendFile(path.join(dataDir, 'tasks.jsonl'), line);

  console.log('✅ Task logged:', task.id);
  console.log(JSON.stringify(task, null, 2));
}

main().catch(console.error);
