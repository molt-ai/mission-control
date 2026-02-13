#!/usr/bin/env npx ts-node

/**
 * Import historical sessions from Clawdbot transcripts
 * Parses JSONL transcripts to extract tasks and prompts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSIONS_DIR = path.join(process.env.HOME!, '.clawdbot/agents/main/sessions');
const DATA_DIR = path.join(__dirname, '..', 'data');

interface TranscriptLine {
  type: string;
  id?: string;
  timestamp?: string;
  message?: {
    role: string;
    content: Array<{
      type: string;
      text?: string;
      name?: string;
      toolCallId?: string;
    }>;
    usage?: {
      input: number;
      output: number;
    };
  };
  customType?: string;
  data?: any;
}

interface ExtractedTask {
  id: string;
  timestamp: string;
  type: 'cron' | 'direct' | 'heartbeat' | 'spawn';
  trigger: string;
  summary: string;
  outcome: 'success' | 'partial' | 'failed';
  tools: string[];
  sessionKey?: string;
}

async function parseTranscript(filepath: string): Promise<ExtractedTask[]> {
  const content = await fs.readFile(filepath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  const tasks: ExtractedTask[] = [];
  const toolsUsed = new Set<string>();
  let currentUserPrompt = '';
  let sessionId = '';
  let sessionTimestamp = '';
  let isCron = false;
  let isHeartbeat = false;
  
  for (const line of lines) {
    try {
      const parsed: TranscriptLine = JSON.parse(line);
      
      // Get session info
      if (parsed.type === 'session') {
        sessionId = parsed.id || '';
        sessionTimestamp = parsed.timestamp || '';
        // Check if cron session by ID pattern
        isCron = filepath.includes('cron:');
      }
      
      // Track user messages (prompts)
      if (parsed.type === 'message' && parsed.message?.role === 'user') {
        const textContent = parsed.message.content.find(c => c.type === 'text');
        if (textContent?.text) {
          currentUserPrompt = textContent.text.slice(0, 200); // Truncate
          isHeartbeat = textContent.text.includes('HEARTBEAT');
        }
      }
      
      // Track tool calls
      if (parsed.type === 'message' && parsed.message?.role === 'assistant') {
        for (const c of parsed.message.content) {
          if (c.type === 'toolCall' && c.name) {
            toolsUsed.add(c.name);
          }
        }
      }
      
    } catch (e) {
      // Skip malformed lines
    }
  }
  
  // If we found tools used, create a task entry
  if (toolsUsed.size > 0 && currentUserPrompt) {
    const taskType = isCron ? 'cron' : isHeartbeat ? 'heartbeat' : 'direct';
    
    // Generate summary from prompt
    let summary = currentUserPrompt
      .replace(/\[message_id: \d+\]/g, '')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 100);
    
    if (summary.length === 100) summary += '...';
    
    tasks.push({
      id: `task_imported_${sessionId.slice(0, 8)}`,
      timestamp: sessionTimestamp || new Date().toISOString(),
      type: taskType,
      trigger: currentUserPrompt.slice(0, 500),
      summary: summary || 'Task completed',
      outcome: 'success', // Assume success for historical
      tools: Array.from(toolsUsed),
      sessionKey: sessionId,
    });
  }
  
  return tasks;
}

async function importAll() {
  console.log('📂 Reading transcripts from:', SESSIONS_DIR);
  
  const files = await fs.readdir(SESSIONS_DIR);
  const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));
  
  console.log(`📄 Found ${jsonlFiles.length} session files`);
  
  let allTasks: ExtractedTask[] = [];
  let processed = 0;
  
  for (const file of jsonlFiles) {
    try {
      const tasks = await parseTranscript(path.join(SESSIONS_DIR, file));
      allTasks = allTasks.concat(tasks);
      processed++;
      
      if (processed % 20 === 0) {
        console.log(`  Processed ${processed}/${jsonlFiles.length}...`);
      }
    } catch (e) {
      console.error(`  ⚠️ Failed to parse ${file}:`, e);
    }
  }
  
  // Sort by timestamp
  allTasks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Write to tasks.jsonl
  const outputPath = path.join(DATA_DIR, 'tasks.jsonl');
  const existingContent = await fs.readFile(outputPath, 'utf-8').catch(() => '');
  
  // Append new tasks
  const newLines = allTasks.map(t => JSON.stringify(t)).join('\n');
  await fs.writeFile(outputPath, existingContent + (existingContent ? '\n' : '') + newLines);
  
  console.log(`\n✅ Imported ${allTasks.length} tasks from ${processed} sessions`);
  console.log(`📊 Tools used across all sessions:`);
  
  const toolCounts: Record<string, number> = {};
  for (const task of allTasks) {
    for (const tool of task.tools) {
      toolCounts[tool] = (toolCounts[tool] || 0) + 1;
    }
  }
  
  Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([tool, count]) => {
      console.log(`  ${tool}: ${count}`);
    });
}

importAll().catch(console.error);
