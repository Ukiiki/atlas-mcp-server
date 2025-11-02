#!/bin/bash
# Hook that runs when user submits a prompt
# This can be used to trigger actions based on specific keywords

USER_PROMPT="$1"

# Log user prompts for debugging (optional)
# echo "[$(date)] User prompt: $USER_PROMPT" >> .claude/logs/prompts.log

# Check for specific keywords and provide helpful responses
if [[ "$USER_PROMPT" =~ deploy|deployment ]]; then
    echo "💡 Tip: Use /deploy command for streamlined deployment workflow"
fi

if [[ "$USER_PROMPT" =~ test|testing ]]; then
    echo "💡 Tip: Use /test command to run the full test suite"
fi

# Exit with 0 to allow the prompt to proceed
exit 0
