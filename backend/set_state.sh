#!/bin/bash
# set_state.sh — Update agent status (Star-Office-UI compatible)
# Usage: ./set_state.sh <state> "<detail>"
# States: idle | writing | researching | executing | syncing | error
# Example: ./set_state.sh writing "Building the dashboard"

AGENT_ID="${AGENT_ID:-}"
STATE="${1:-idle}"
DETAIL="${2:-}"
WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="$WORKSPACE/state.json"
API_URL="${AGENT_OFFICE_API:-http://localhost:4000}"

# Write state.json (Star-Office-UI pattern — backend reads this directly)
cat > "$STATE_FILE" << EOF
{
  "state": "$STATE",
  "detail": "$DETAIL",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%S)",
  "ttl_seconds": 300
}
EOF

# Also push to AgentOffice backend if AGENT_ID is set
if [ -n "$AGENT_ID" ]; then
  curl -s -X POST "$API_URL/api/agents/set_state" \
    -H "Content-Type: application/json" \
    -d "{\"agentId\":\"$AGENT_ID\",\"state\":\"$STATE\",\"detail\":\"$DETAIL\"}" \
    > /dev/null 2>&1 || true
fi

echo "[$(date -u +%H:%M:%S)] $STATE: $DETAIL"
