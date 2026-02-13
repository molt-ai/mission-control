// Core data types for Clawd Dashboard

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  updatedAt: string;
  language: string | null;
  stars: number;
  isPrivate: boolean;
}

export interface Task {
  id: string;
  timestamp: string;
  type: 'cron' | 'direct' | 'heartbeat' | 'spawn';
  trigger: string; // The prompt/cron that triggered this
  summary: string; // What was accomplished
  outcome: 'success' | 'partial' | 'failed';
  durationMs?: number;
  tools: string[]; // Tools used
  sessionKey?: string;
  // Added for prompt improvement
  improvedPrompt?: string;
  improvementNotes?: string;
}

export interface PromptAnalysis {
  id: string;
  timestamp: string;
  originalPrompt: string;
  taskIds: string[]; // Tasks this prompt triggered
  successRate: number;
  patterns: string[]; // Detected patterns
  suggestedImprovement?: string;
  improvementReason?: string;
}

export interface SessionHealth {
  sessionKey: string;
  startTime: string;
  lastActivity: string;
  turnCount: number;
  clarificationRequests: number;
  taskFailures: number;
  repetitions: number;
  healthScore: number; // 0-100
  recommendation: 'continue' | 'consider-new' | 'start-new';
  signals: HealthSignal[];
}

export interface HealthSignal {
  type: 'length' | 'clarification' | 'failure' | 'repetition' | 'age';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface DashboardStats {
  totalTasks: number;
  successRate: number;
  avgTasksPerDay: number;
  topTriggerTypes: { type: string; count: number }[];
  topTools: { tool: string; count: number }[];
  recentHealth: SessionHealth | null;
}
