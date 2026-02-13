// Generate actual usable improved prompts, not generic advice

interface PromptImprovement {
  improvedPrompt: string;
  notes: string;
}

export function improvePrompt(originalPrompt: string, tools: string[], outcome: string): PromptImprovement {
  // Clean up the prompt first
  let cleaned = originalPrompt
    .replace(/\[message_id: [^\]]+\]/g, '')
    .replace(/\[iMessage [^\]]+\]/g, '')
    .replace(/\[Queued messages[^\]]*\]/g, '')
    .replace(/---\s*Queued #\d+/g, '')
    .trim();

  // If it's already a good structured prompt, don't change much
  if (cleaned.includes('1.') && cleaned.includes('2.') || cleaned.length > 300) {
    return {
      improvedPrompt: cleaned,
      notes: 'Already well-structured with clear steps.'
    };
  }

  // Very short prompts need expansion
  if (cleaned.length < 30) {
    const expanded = expandShortPrompt(cleaned, tools);
    return {
      improvedPrompt: expanded.prompt,
      notes: expanded.notes
    };
  }

  // Medium prompts - add structure
  const structured = structurePrompt(cleaned, tools, outcome);
  return {
    improvedPrompt: structured.prompt,
    notes: structured.notes
  };
}

function expandShortPrompt(prompt: string, tools: string[]): { prompt: string; notes: string } {
  const lower = prompt.toLowerCase();
  
  // Common short prompts and their expansions
  if (lower.includes('are you there') || lower.includes('hello') || lower.includes('hi')) {
    return {
      prompt: prompt, // Keep as-is for greetings
      notes: 'Simple greeting - no improvement needed.'
    };
  }

  if (lower.includes('check') || lower.includes('status')) {
    return {
      prompt: `Check the status of [SPECIFIC THING] and report:
- Current state
- Any issues or blockers
- Recommended next actions`,
      notes: 'Added specificity and structured output format.'
    };
  }

  if (lower.includes('fix') || lower.includes('debug')) {
    return {
      prompt: `Debug and fix [SPECIFIC ISSUE]:

Context: [What you were doing when it broke]
Error: [Exact error message or behavior]
Expected: [What should happen instead]

After fixing, verify the fix works.`,
      notes: 'Added debugging context template for faster resolution.'
    };
  }

  if (lower.includes('build') || lower.includes('create') || lower.includes('make')) {
    return {
      prompt: `Build [SPECIFIC THING]:

Requirements:
- [Key requirement 1]
- [Key requirement 2]

Tech: [Preferred stack if any]
Output: [Where to put it, how to run it]`,
      notes: 'Added requirements and output specification.'
    };
  }

  // Generic expansion for unknown short prompts
  return {
    prompt: `${prompt}

Specifics:
- [Add what exactly you need]
- [Add any constraints]
- [Add expected output format]`,
    notes: 'Short prompt - added structure for clarity. Fill in the specifics.'
  };
}

function structurePrompt(prompt: string, tools: string[], outcome: string): { prompt: string; notes: string } {
  const lower = prompt.toLowerCase();
  const notes: string[] = [];
  let improved = prompt;

  // Check for common issues and fix them

  // 1. No clear success criteria
  if (!lower.includes('when done') && !lower.includes('success') && !lower.includes('complete') && !lower.includes('verify')) {
    improved += '\n\nWhen done: [Describe what "done" looks like]';
    notes.push('Added success criteria placeholder');
  }

  // 2. Multiple tasks bundled
  const andCount = (prompt.match(/\band\b/gi) || []).length;
  const alsoCount = (prompt.match(/\balso\b/gi) || []).length;
  if (andCount + alsoCount > 2) {
    notes.push('Consider splitting into separate tasks for better focus');
  }

  // 3. No output format specified for data tasks
  if (tools.includes('web_search') || tools.includes('web_fetch')) {
    if (!lower.includes('list') && !lower.includes('summary') && !lower.includes('table') && !lower.includes('format')) {
      improved += '\n\nFormat: [bullet list / table / summary paragraph]';
      notes.push('Added output format for research tasks');
    }
  }

  // 4. No constraints for broad tasks
  if ((lower.includes('find') || lower.includes('search') || lower.includes('research')) && 
      !lower.includes('limit') && !lower.includes('top') && !lower.includes('max') && !lower.includes('only')) {
    improved += '\n\nLimit: Top 5 results only';
    notes.push('Added result limit to prevent scope creep');
  }

  // 5. Coding tasks without file context
  if ((tools.includes('write') || tools.includes('edit')) && 
      !lower.includes('file') && !lower.includes('path') && !lower.includes('in ')) {
    notes.push('Consider specifying target file/directory');
  }

  return {
    prompt: improved,
    notes: notes.length > 0 ? notes.join('. ') + '.' : 'Prompt looks good as-is.'
  };
}

// Batch improve all tasks
export function improveTasks(tasks: any[]): any[] {
  return tasks.map(task => {
    const improvement = improvePrompt(task.trigger, task.tools, task.outcome);
    return {
      ...task,
      improvedPrompt: improvement.improvedPrompt,
      improvementNotes: improvement.notes
    };
  });
}
