@echo off
echo Setting up Amazon Q Developer MCP in IDE...

REM Install Amazon Q extension for VS Code
echo Installing Amazon Q extension for VS Code...
code --install-extension amazonwebservices.amazon-q-vscode

REM Create VS Code workspace settings if not exists
if not exist ".vscode" mkdir ".vscode"

echo.
echo ✅ IDE MCP setup complete!
echo.
echo Next steps:
echo 1. Open VS Code: code .
echo 2. Press Ctrl+L to open Amazon Q chat
echo 3. Click "Configure MCP servers" at top
echo 4. Verify hootner-deployment server is loaded
echo 5. Test: "List deployment tools"
echo.
echo JetBrains setup:
echo 1. Install Amazon Q plugin from marketplace
echo 2. Restart IDE
echo 3. Open Amazon Q panel
echo 4. Configure MCP servers using .idea/amazonq-mcp.xml
echo.
pause