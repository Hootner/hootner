# HOOTNER Windows Registry Setup
# Populates registry keys with values from .env

$ErrorActionPreference = "Stop"

# Registry base path
$RegPath = "HKCU:\Software\HOOTNER"

# Create registry key if not exists
if (!(Test-Path $RegPath)) {
    New-Item -Path $RegPath -Force | Out-Null
}

# Read .env file
$envFile = "d:\my-local-repo\.env"
if (!(Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile"
    exit 1
}

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $envVars[$matches[1].Trim()] = $matches[2].Trim()
    }
}

# Set registry values
Set-ItemProperty -Path $RegPath -Name "AWS_REGION" -Value $envVars["AWS_REGION"]
Set-ItemProperty -Path $RegPath -Name "DYNAMODB_ENDPOINT" -Value $envVars["DYNAMODB_ENDPOINT"]
Set-ItemProperty -Path $RegPath -Name "REDIS_URL" -Value $envVars["REDIS_URL"]
Set-ItemProperty -Path $RegPath -Name "API_PORT" -Value $envVars["API_PORT"]
Set-ItemProperty -Path $RegPath -Name "FRONTEND_PORT" -Value $envVars["FRONTEND_PORT"]
Set-ItemProperty -Path $RegPath -Name "FRONTEND_URL" -Value $envVars["FRONTEND_URL"]
Set-ItemProperty -Path $RegPath -Name "NODE_ENV" -Value $envVars["NODE_ENV"]
Set-ItemProperty -Path $RegPath -Name "UPLOAD_BUCKET" -Value $envVars["UPLOAD_BUCKET"]
Set-ItemProperty -Path $RegPath -Name "VIDEO_BUCKET" -Value $envVars["VIDEO_BUCKET"]
Set-ItemProperty -Path $RegPath -Name "TRAINING_DATA_BUCKET" -Value $envVars["TRAINING_DATA_BUCKET"]
Set-ItemProperty -Path $RegPath -Name "AWS_S3_TABLE_BUCKET_NAME" -Value $envVars["AWS_S3_TABLE_BUCKET_NAME"]

Write-Host "✅ Registry keys populated at $RegPath" -ForegroundColor Green
