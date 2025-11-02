#!/bin/bash
# Hook that runs before each tool call
# Can be used to log, validate, or request approval for certain operations

TOOL_NAME="$1"
TOOL_ARGS="$2"

# Create approval request for sensitive operations
case "$TOOL_NAME" in
    "Bash")
        # Check if it's a destructive command
        if [[ "$TOOL_ARGS" =~ rm\ -rf|DROP|DELETE|truncate ]]; then
            echo "⚠️  Warning: Destructive operation detected!"
            echo "Tool: $TOOL_NAME"
            echo "Args: $TOOL_ARGS"

            # Create approval request via API
            curl -s -X POST http://localhost:3000/api/approvals \
                -H "Content-Type: application/json" \
                -d "{
                    \"title\": \"Destructive Bash Command\",
                    \"description\": \"Claude wants to run: $TOOL_ARGS\",
                    \"category\": \"code_change\",
                    \"metadata\": {\"tool\": \"$TOOL_NAME\", \"command\": \"$TOOL_ARGS\"}
                }" > /dev/null 2>&1
        fi
        ;;

    "Write"|"Edit")
        # Check if modifying critical files
        if [[ "$TOOL_ARGS" =~ package\.json|\.env|vercel\.json|tsconfig\.json ]]; then
            echo "📝 Configuration file change detected"

            # Create approval request
            curl -s -X POST http://localhost:3000/api/approvals \
                -H "Content-Type: application/json" \
                -d "{
                    \"title\": \"Configuration File Change\",
                    \"description\": \"Claude wants to modify critical file\",
                    \"category\": \"configuration\",
                    \"metadata\": {\"tool\": \"$TOOL_NAME\", \"file\": \"$TOOL_ARGS\"}
                }" > /dev/null 2>&1
        fi
        ;;
esac

# Allow the tool call to proceed
exit 0
