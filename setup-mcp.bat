@echo off
echo Setting up Amazon Q Developer with MCP for HOOTNER...

REM Create MCP config directory
if not exist "%USERPROFILE%\.aws\amazonq" mkdir "%USERPROFILE%\.aws\amazonq"

REM Copy MCP configuration
copy mcp-config.json "%USERPROFILE%\.aws\amazonq\mcp.json"

REM Install MCP SDK dependencies
npm install @modelcontextprotocol/sdk

REM Install Python tools for AWS CDK MCP server
pip install uv
uvx --help >nul 2>&1 || pip install uvx

echo.
echo ✅ MCP setup complete!
echo.
echo Next steps:
echo 1. Start Amazon Q CLI: q
echo 2. List tools: /tools
echo 3. Trust tools: /tools trust
echo 4. Test deployment: "Deploy HOOTNER in dev environment"
echo.
echo Available MCP tools:
echo - deploy_service: Deploy HOOTNER services
echo - run_chaos_test: Execute chaos engineering tests  
echo - check_system_health: Monitor system health
echo - backup_system: Trigger backups with PITR
echo - security_audit: Run security scans
echo.
pause