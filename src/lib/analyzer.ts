// Prompt pattern analysis and improvement suggestions

import { Task, PromptAnalysis } from './types';

interface PromptPattern {
  name: string;
  detect: (prompt: string) => boolean;
  severity: 'info' | 'warning' | 'error';
  suggestion: string;
}

const PATTERNS: PromptPattern[] = [
  {
    name: 'vague-goal',
    detect: (p) => p.length < 50 && !p.includes('specific') && !p.includes('exactly'),
    severity: 'warning',
    suggestion: 'Add specific success criteria. What does "done" look like?',
  },
  {
    name: 'missing-context',
    detect: (p) => !p.includes('because') && !p.includes('context') && !p.includes('background'),
    severity: 'info',
    suggestion: 'Include why you need this. Context helps prioritize and scope.',
  },
  {
    name: 'multi-task',
    detect: (p) => (p.match(/\band\b/gi) || []).length > 3 || p.includes('also') && p.includes('then'),
    severity: 'warning',
    suggestion: 'Consider breaking into separate tasks. Fewer goals = better focus.',
  },
  {
    name: 'no-constraints',
    detect: (p) => !p.includes('limit') && !p.includes('only') && !p.includes('just') && !p.includes('max'),
    severity: 'info',
    suggestion: 'Add constraints to prevent scope creep. "Only X" or "Max Y".',
  },
  {
    name: 'unclear-format',
    detect: (p) => !p.includes('list') && !p.includes('table') && !p.includes('summary') && !p.includes('format'),
    severity: 'info',
    suggestion: 'Specify desired output format when it matters.',
  },
];

export function analyzePrompt(prompt: string, tasks: Task[]): Partial<PromptAnalysis> {
  const detectedPatterns: string[] = [];
  let worstSeverity: 'info' | 'warning' | 'error' = 'info';

  for (const pattern of PATTERNS) {
    if (pattern.detect(prompt)) {
      detectedPatterns.push(pattern.name);
      if (pattern.severity === 'error') worstSeverity = 'error';
      else if (pattern.severity === 'warning' && worstSeverity !== 'error') worstSeverity = 'warning';
    }
  }

  // Calculate success rate for this prompt's tasks
  const relatedTasks = tasks.filter(t => t.trigger === prompt);
  const successRate = relatedTasks.length > 0
    ? relatedTasks.filter(t => t.outcome === 'success').length / relatedTasks.length
    : 1;

  // Generate improvement suggestion based on patterns
  let suggestedImprovement: string | undefined;
  let improvementReason: string | undefined;

  if (detectedPatterns.length > 0 && successRate < 0.8) {
    const mainPattern = PATTERNS.find(p => p.name === detectedPatterns[0]);
    if (mainPattern) {
      improvementReason = mainPattern.suggestion;
      suggestedImprovement = generateImprovedPrompt(prompt, detectedPatterns);
    }
  }

  return {
    originalPrompt: prompt,
    patterns: detectedPatterns,
    successRate,
    suggestedImprovement,
    improvementReason,
  };
}

function generateImprovedPrompt(original: string, patterns: string[]): string {
  let improved = original;

  if (patterns.includes('vague-goal')) {
    improved += '\n\nSuccess criteria: [SPECIFY WHAT DONE LOOKS LIKE]';
  }
  if (patterns.includes('missing-context')) {
    improved = 'Context: [WHY THIS MATTERS]\n\n' + improved;
  }
  if (patterns.includes('no-constraints')) {
    improved += '\n\nConstraints: [LIMITS/BOUNDARIES]';
  }

  return improved;
}

export function comparePromptEffectiveness(
  prompts: PromptAnalysis[]
): { pattern: string; avgSuccessWithout: number; avgSuccessWith: number }[] {
  const patternStats: Record<string, { with: number[]; without: number[] }> = {};

  for (const pattern of PATTERNS) {
    patternStats[pattern.name] = { with: [], without: [] };
  }

  for (const p of prompts) {
    for (const pattern of PATTERNS) {
      if (p.patterns.includes(pattern.name)) {
        patternStats[pattern.name].with.push(p.successRate);
      } else {
        patternStats[pattern.name].without.push(p.successRate);
      }
    }
  }

  return Object.entries(patternStats).map(([pattern, stats]) => ({
    pattern,
    avgSuccessWith: stats.with.length > 0 ? avg(stats.with) : 0,
    avgSuccessWithout: stats.without.length > 0 ? avg(stats.without) : 0,
  }));
}

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
