// Session health detection - context rot signals

import { SessionHealth, HealthSignal } from './types';

interface SessionMetrics {
  sessionKey: string;
  startTime: Date;
  turnCount: number;
  clarificationRequests: number;
  taskFailures: number;
  repetitions: number;
}

const THRESHOLDS = {
  maxTurns: 50,           // Conversations get unwieldy after this
  maxAge: 4 * 60 * 60 * 1000,  // 4 hours
  maxClarifications: 3,   // Too many "what did you mean?" signals confusion
  maxFailures: 2,         // Multiple failures suggest context issues
  maxRepetitions: 2,      // Repeating myself = I've lost track
};

export function calculateSessionHealth(metrics: SessionMetrics): SessionHealth {
  const signals: HealthSignal[] = [];
  let healthScore = 100;

  const ageMs = Date.now() - metrics.startTime.getTime();

  // Check turn count
  if (metrics.turnCount > THRESHOLDS.maxTurns) {
    const severity = metrics.turnCount > THRESHOLDS.maxTurns * 1.5 ? 'high' : 'medium';
    signals.push({
      type: 'length',
      severity,
      message: `${metrics.turnCount} turns - conversation is getting long`,
    });
    healthScore -= severity === 'high' ? 25 : 15;
  }

  // Check session age
  if (ageMs > THRESHOLDS.maxAge) {
    const hours = Math.round(ageMs / (60 * 60 * 1000));
    const severity = ageMs > THRESHOLDS.maxAge * 2 ? 'high' : 'medium';
    signals.push({
      type: 'age',
      severity,
      message: `Session is ${hours}h old - context may be stale`,
    });
    healthScore -= severity === 'high' ? 20 : 10;
  }

  // Check clarification requests
  if (metrics.clarificationRequests > THRESHOLDS.maxClarifications) {
    signals.push({
      type: 'clarification',
      severity: 'high',
      message: `${metrics.clarificationRequests} clarifications needed - possible context confusion`,
    });
    healthScore -= 20;
  }

  // Check task failures
  if (metrics.taskFailures > THRESHOLDS.maxFailures) {
    signals.push({
      type: 'failure',
      severity: 'high',
      message: `${metrics.taskFailures} task failures - something may be off`,
    });
    healthScore -= 25;
  }

  // Check repetitions
  if (metrics.repetitions > THRESHOLDS.maxRepetitions) {
    signals.push({
      type: 'repetition',
      severity: 'medium',
      message: `Repeating information ${metrics.repetitions} times - context may be degrading`,
    });
    healthScore -= 15;
  }

  // Clamp score
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Determine recommendation
  let recommendation: 'continue' | 'consider-new' | 'start-new';
  if (healthScore >= 70) {
    recommendation = 'continue';
  } else if (healthScore >= 40) {
    recommendation = 'consider-new';
  } else {
    recommendation = 'start-new';
  }

  return {
    sessionKey: metrics.sessionKey,
    startTime: metrics.startTime.toISOString(),
    lastActivity: new Date().toISOString(),
    turnCount: metrics.turnCount,
    clarificationRequests: metrics.clarificationRequests,
    taskFailures: metrics.taskFailures,
    repetitions: metrics.repetitions,
    healthScore,
    recommendation,
    signals,
  };
}

export function getHealthColor(score: number): string {
  if (score >= 70) return 'text-green-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function getHealthEmoji(score: number): string {
  if (score >= 70) return '🟢';
  if (score >= 40) return '🟡';
  return '🔴';
}
