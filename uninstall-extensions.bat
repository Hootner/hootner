@echo off
REM Uninstall unnecessary VS Code extensions for HOOTNER

REM Django extensions
code --uninstall-extension batisteo.vscode-django
code --uninstall-extension bibhasdn.django-html
code --uninstall-extension bibhasdn.django-snippets
code --uninstall-extension bigonesystems.django
code --uninstall-extension dhavalvira.django-import-libraries
code --uninstall-extension joephilip.pythondjangocodesnippet
code --uninstall-extension qeude.django-test-path
code --uninstall-extension thebarkman.vscode-djaneiro

REM PHP extensions
code --uninstall-extension devsense.composer-php-vscode
code --uninstall-extension devsense.intelli-php-vscode
code --uninstall-extension devsense.phptools-vscode
code --uninstall-extension devsense.profiler-php-vscode
code --uninstall-extension rifi2k.format-html-in-php
code --uninstall-extension xdebug.php-debug

REM Java extensions
code --uninstall-extension redhat.java
code --uninstall-extension vscjava.vscode-java-debug
code --uninstall-extension vscjava.vscode-java-test

REM C/C++ extensions
code --uninstall-extension ms-vscode.cmake-tools
code --uninstall-extension ms-vscode.cpptools
code --uninstall-extension ms-vscode.cpptools-extension-pack
code --uninstall-extension ms-vscode.cpptools-themes
code --uninstall-extension ms-vscode.makefile-tools
code --uninstall-extension twxs.cmake

REM Go extension
code --uninstall-extension golang.go

REM Ruby extension
code --uninstall-extension shopify.ruby-lsp

REM Mobile dev (Flutter/Dart/Android)
code --uninstall-extension dart-code.dart-code
code --uninstall-extension dart-code.flutter

REM C# extension
code --uninstall-extension oleg-shilo.cs-script

REM Duplicate AI assistants (keeping Amazon Q)
code --uninstall-extension huggingface.huggingface-vscode-chat
code --uninstall-extension google.geminicodeassist
code --uninstall-extension ms-azuretools.vscode-azure-github-copilot
code --uninstall-extension ms-windows-ai-studio.windows-ai-studio
code --uninstall-extension vukrosic.all-in-one-ai-interface
code --uninstall-extension danielsanmedium.dscodegpt
code --uninstall-extension sourcery.sourcery

REM Deno (using Node.js)
code --uninstall-extension denoland.vscode-deno

REM Bun (using npm)
code --uninstall-extension oven.bun-vscode

echo Done! Restart VS Code to complete uninstallation.
pause
