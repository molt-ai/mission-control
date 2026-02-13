# Clawd Dashboard

Personal AI productivity dashboard. Track tasks, improve prompts, monitor session health.

## Quick Start

```bash
npm run dev
# Open http://localhost:3000
```

## What It Does

### 📋 Task Tracking
Every task Molt completes gets logged with:
- Type (cron, direct, heartbeat, spawn)
- Trigger prompt
- Outcome (success, partial, failed)
- Tools used

### 💡 Prompt Improvement
Analyzes your prompts for common anti-patterns:
- Vague goals
- Missing context
- Too many tasks bundled
- No constraints
- Unclear output format

Suggests improved versions to help you level up prompting over time.

### 🏥 Session Health
Monitors conversation quality signals:
- Turn count (long = context rot risk)
- Session age
- Clarification requests
- Task failures
- Repetitions

Recommends when to start fresh with `/new`.

## Logging Tasks

### Shell script (quick)
```bash
./log-task.sh "Summary of what was done" direct success "tool1,tool2"
```

### TypeScript (full control)
```typescript
import { logTask } from '@/lib/logger';

await logTask({
  type: 'direct',
  trigger: 'User asked to build X',
  summary: 'Built X with Y and Z',
  outcome: 'success',
  tools: ['write', 'exec'],
});
```

## Data

All data lives in `data/`:
- `tasks.jsonl` - Completed tasks
- `prompts.jsonl` - Prompt analyses
- `sessions.jsonl` - Session health snapshots

JSONL format = append-only, git-friendly, easy to process.

## Architecture

```
src/
├── app/
│   ├── page.tsx        # Main dashboard
│   └── api/stats/      # Stats API
└── lib/
    ├── types.ts        # Data types
    ├── data.ts         # JSONL reading
    ├── analyzer.ts     # Prompt analysis
    ├── health.ts       # Session health
    └── logger.ts       # Task logging
```

## Future

- [ ] Real-time session health monitoring
- [ ] Prompt A/B testing
- [ ] Pattern learning over time
- [ ] Export insights
