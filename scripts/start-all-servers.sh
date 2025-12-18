#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BRIGHT_GREEN='\033[0;92m'
NC='\033[0m' # No Color

# Server configurations (name:script:port:color)
declare -a servers=(
    "Main Server:server.js:3000:$GREEN"
    "MCP Server:servers/mcp-server.js:3001:$BLUE"
    "Collaboration Server:servers/collab-server.js:3002:$MAGENTA"
    "Electron Code Editor Server:servers/electron-code-editor-server.js:3003:$CYAN"
    "HTML Pages Server:servers/html-pages-server.js:3004:$YELLOW"
    "Hub App Server:servers/hub-app.js:3005:$RED"
    "Secure Server:servers/secure-server.js:3006:$WHITE"
    "Video Player Server:servers/video-player-server.js:3007:$GRAY"
    "HOOTNER MCP Server:servers/hootner-mcp-server.js:3008:$BRIGHT_GREEN"
)

# Array to store process IDs
declare -a pids=()

# Cleanup function
cleanup() {
    echo -e "\n🛑 Shutting down all servers..."

    for pid in "${pids[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "⏹️  Stopping process $pid"
            kill -TERM "$pid" 2>/dev/null
        fi
    done

    # Wait a bit for graceful shutdown
    sleep 3

    # Force kill if still running
    for pid in "${pids[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "💀 Force killing process $pid"
            kill -KILL "$pid" 2>/dev/null
        fi
    done

    echo "✅ All servers stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Starting HOOTNER servers..."
echo

# Set environment
export NODE_ENV=${NODE_ENV:-development}

# Start each server
for server_config in "${servers[@]}"; do
    IFS=':' read -r name script port color <<< "$server_config"

    # Check if server file exists
    if [[ ! -f "$script" ]]; then
        echo -e "${color}⚠️  $name script not found: $script${NC}"
        pids+=(0)  # Add placeholder
        continue
    fi

    echo -e "${color}🔄 Starting $name on port $port...${NC}"

    # Start server in background
    PORT="$port" node "$script" &
    pid=$!
    pids+=($pid)

    # Small delay between starts
    sleep 1
done

echo
echo "🎉 All servers started! Press Ctrl+C to stop all servers."
echo

# Display server status
echo "📊 Server Status:"
for i in "${!servers[@]}"; do
    IFS=':' read -r name script port color <<< "${servers[$i]}"
    pid=${pids[$i]}

    if [[ $pid -ne 0 ]] && kill -0 "$pid" 2>/dev/null; then
        status="🟢 Running"
    else
        status="🔴 Failed"
    fi

    echo -e "${color}  $name: $status - http://localhost:$port${NC}"
done
echo

# Wait for all background processes
wait
