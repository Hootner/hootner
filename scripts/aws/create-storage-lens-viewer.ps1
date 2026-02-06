# Creates/updates an IAM user that can view S3 Storage Lens dashboards.
# Root user cannot view Storage Lens dashboards in the console.
#
# Run (PowerShell):
#   .\scripts\aws\create-storage-lens-viewer.ps1

$ErrorActionPreference = 'Stop'

$USER_NAME = 'storage-lens-viewer'
$POLICY_NAME = 'StorageLensReadOnly'
$CHANGE_PW_POLICY_ARN = 'arn:aws:iam::aws:policy/IAMUserChangePassword'

function Require-AwsCli {
  $cmd = Get-Command aws -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw 'AWS CLI not found. Install AWS CLI v2 and ensure `aws` is on PATH.'
  }
}

Require-AwsCli

$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text --no-cli-pager).Trim()
if ([string]::IsNullOrWhiteSpace($ACCOUNT_ID)) {
  throw 'Failed to resolve AWS account id (is AWS CLI configured/authorized?). Try: aws sts get-caller-identity --no-cli-pager'
}

Write-Host "Account: $ACCOUNT_ID"

# 1) Create user (idempotent)
$null = aws iam get-user --user-name $USER_NAME --no-cli-pager 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "User exists: $USER_NAME"
} else {
  aws iam create-user --user-name $USER_NAME --no-cli-pager | Out-Null
  Write-Host "Created user: $USER_NAME"
}

# 2) Create or find policy (idempotent)
$policyArn = (aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn | [0]" --output text --no-cli-pager).Trim()
if ([string]::IsNullOrWhiteSpace($policyArn) -or $policyArn -eq 'None') {
  $policyDoc = @'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StorageLensReadOnly",
      "Effect": "Allow",
      "Action": [
        "s3:ListStorageLensConfigurations",
        "s3:GetStorageLensConfiguration",
        "s3:GetStorageLensDashboard"
      ],
      "Resource": "*"
    }
  ]
}
'@

  try {
    $policyArn = (aws iam create-policy --policy-name $POLICY_NAME --policy-document $policyDoc --query 'Policy.Arn' --output text --no-cli-pager).Trim()
    Write-Host "Created policy: $policyArn"
  } catch {
    # If it already exists due to a race or earlier partial run, re-fetch it
    $policyArn = (aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn | [0]" --output text --no-cli-pager).Trim()
    if ([string]::IsNullOrWhiteSpace($policyArn) -or $policyArn -eq 'None') { throw }
    Write-Host "Policy exists (after retry): $policyArn"
  }
} else {
  Write-Host "Policy exists: $policyArn"
}

if ([string]::IsNullOrWhiteSpace($policyArn) -or $policyArn -eq 'None') {
  throw 'POLICY_ARN is empty; policy creation/lookup failed.'
}

# 3) Attach policy (safe to re-run)
aws iam attach-user-policy --user-name $USER_NAME --policy-arn $policyArn --no-cli-pager | Out-Null
Write-Host 'Attached policy to user.'

# Allow the IAM user to change their own password (required for first-login password reset)
aws iam attach-user-policy --user-name $USER_NAME --policy-arn $CHANGE_PW_POLICY_ARN --no-cli-pager | Out-Null
Write-Host 'Attached password-change policy to user.'

# 4) Create console login (optional, but needed for console access)
# Use a password that usually satisfies org password policies.
$random = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 6 | ForEach-Object {[char]$_})
$tempPassword = "TempP@ssw0rd-$random-$(Get-Date -Format 'yyyyMMddHHmmss')"

$null = aws iam get-login-profile --user-name $USER_NAME --no-cli-pager 2>$null
if ($LASTEXITCODE -eq 0) {
  aws iam update-login-profile --user-name $USER_NAME --password $tempPassword --password-reset-required --no-cli-pager | Out-Null
  Write-Host 'Updated login profile password.'
} else {
  aws iam create-login-profile --user-name $USER_NAME --password $tempPassword --password-reset-required --no-cli-pager | Out-Null
  Write-Host 'Created login profile.'
}

Write-Host "Console sign-in (option A): https://$ACCOUNT_ID.signin.aws.amazon.com/console/"
Write-Host "Console sign-in (option B): https://signin.aws.amazon.com/console (choose 'IAM user', enter Account ID)"
Write-Host "Username: $USER_NAME"
Write-Host "Temp password: $tempPassword"

Write-Host ''
Write-Host 'Verify:'
Write-Host "  aws iam list-attached-user-policies --user-name $USER_NAME --no-cli-pager"
Write-Host "  aws iam get-login-profile --user-name $USER_NAME --no-cli-pager"
