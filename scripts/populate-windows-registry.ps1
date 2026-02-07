# Populate Empty Windows Registry Values
$ErrorActionPreference = "Stop"

# ShellUI values
$shellPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
if (!(Test-Path $shellPath)) { New-Item -Path $shellPath -Force | Out-Null }
Set-ItemProperty -Path $shellPath -Name "TaskbarGlomLevel" -Value 0 -Type DWord
Set-ItemProperty -Path $shellPath -Name "ShowTaskViewButton" -Value 1 -Type DWord
Set-ItemProperty -Path $shellPath -Name "TaskbarSizeMove" -Value 1 -Type DWord

# Notepad values
$notepadPath = "HKCU:\Software\Microsoft\Notepad"
if (!(Test-Path $notepadPath)) { New-Item -Path $notepadPath -Force | Out-Null }
Set-ItemProperty -Path $notepadPath -Name "StatusBar" -Value 1 -Type DWord
Set-ItemProperty -Path $notepadPath -Name "fWrap" -Value 1 -Type DWord
Set-ItemProperty -Path $notepadPath -Name "lfFaceName" -Value "Consolas" -Type String
Set-ItemProperty -Path $notepadPath -Name "iPointSize" -Value 110 -Type DWord

# Windows Terminal
$terminalPath = "HKCU:\Console"
if (!(Test-Path $terminalPath)) { New-Item -Path $terminalPath -Force | Out-Null }
Set-ItemProperty -Path $terminalPath -Name "FaceName" -Value "Cascadia Code" -Type String
Set-ItemProperty -Path $terminalPath -Name "FontSize" -Value 0x140000 -Type DWord

# File Explorer
$explorerPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer"
if (!(Test-Path $explorerPath)) { New-Item -Path $explorerPath -Force | Out-Null }
Set-ItemProperty -Path $explorerPath -Name "ShowRecent" -Value 1 -Type DWord
Set-ItemProperty -Path $explorerPath -Name "ShowFrequent" -Value 1 -Type DWord

Write-Host "✅ Windows registry values populated" -ForegroundColor Green
