#!/bin/bash
# Quick task logger for Molt
# Usage: ./log-task.sh "summary" [type] [outcome] [tools]
# Example: ./log-task.sh "Built dashboard scaffold" direct success "write,exec"

SUMMARY="${1:-Task completed}"
TYPE="${2:-direct}"
OUTCOME="${3:-success}"
TOOLS="${4:-}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ID="task_$(date +%s)_$(cat /dev/urandom | LC_ALL=C tr -dc 'a-z0-9' | head -c 6)"

# Build JSON
if [ -n "$TOOLS" ]; then
  TOOLS_JSON=$(echo "$TOOLS" | tr ',' '\n' | sed 's/.*/"&"/' | tr '\n' ',' | sed 's/,$//')
  TOOLS_JSON="[$TOOLS_JSON]"
else
  TOOLS_JSON="[]"
fi

JSON="{\"id\":\"$ID\",\"timestamp\":\"$TIMESTAMP\",\"type\":\"$TYPE\",\"trigger\":\"manual\",\"summary\":\"$SUMMARY\",\"outcome\":\"$OUTCOME\",\"tools\":$TOOLS_JSON}"

# Append to tasks.jsonl
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "$JSON" >> "$SCRIPT_DIR/data/tasks.jsonl"

echo "✅ Task logged: $ID"
echo "$JSON" | jq . 2>/dev/null || echo "$JSON"
