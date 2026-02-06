#!/usr/bin/env bash
set -euo pipefail

# Creates/updates an IAM user that can view S3 Storage Lens dashboards.
# Note: Root user cannot view Storage Lens dashboards in the console.

USER_NAME="storage-lens-viewer"
POLICY_NAME="StorageLensReadOnly"
CHANGE_PW_POLICY_ARN="arn:aws:iam::aws:policy/IAMUserChangePassword"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text --no-cli-pager)"
echo "Account: ${ACCOUNT_ID}"

# 1) Create user (idempotent)
if aws iam get-user --user-name "${USER_NAME}" >/dev/null 2>&1; then
  echo "User exists: ${USER_NAME}"
else
  aws iam create-user --user-name "${USER_NAME}" >/dev/null
  echo "Created user: ${USER_NAME}"
fi

# 2) Create or find policy (idempotent)
POLICY_ARN="$(aws iam list-policies --scope Local \
  --query "Policies[?PolicyName=='${POLICY_NAME}'].Arn | [0]" \
  --output text --no-cli-pager)"

if [[ -z "${POLICY_ARN}" || "${POLICY_ARN}" == "None" ]]; then
  POLICY_ARN="$(aws iam create-policy \
    --policy-name "${POLICY_NAME}" \
    --policy-document '{
      "Version":"2012-10-17",
      "Statement":[
        {
          "Sid":"StorageLensReadOnly",
          "Effect":"Allow",
          "Action":[
            "s3:ListStorageLensConfigurations",
            "s3:GetStorageLensConfiguration",
            "s3:GetStorageLensDashboard"
          ],
          "Resource":"*"
        }
      ]
    }' \
    --query 'Policy.Arn' --output text --no-cli-pager)"
  echo "Created policy: ${POLICY_ARN}"
else
  echo "Policy exists: ${POLICY_ARN}"
fi

if [[ -z "${POLICY_ARN}" || "${POLICY_ARN}" == "None" ]]; then
  echo "ERROR: POLICY_ARN is empty; policy creation/lookup failed." >&2
  exit 1
fi

# 3) Attach policy (safe to re-run)
aws iam attach-user-policy --user-name "${USER_NAME}" --policy-arn "${POLICY_ARN}" >/dev/null
echo "Attached policy to user." 

# Allow the IAM user to change their own password (required for first-login password reset)
aws iam attach-user-policy --user-name "${USER_NAME}" --policy-arn "${CHANGE_PW_POLICY_ARN}" >/dev/null
echo "Attached password-change policy to user." 

# 4) Create console login (optional, but needed for console access)
TEMP_PASSWORD="ChangeMe-$(date +%s)"
if aws iam get-login-profile --user-name "${USER_NAME}" >/dev/null 2>&1; then
  aws iam update-login-profile --user-name "${USER_NAME}" --password "${TEMP_PASSWORD}" --password-reset-required >/dev/null
  echo "Updated login profile password." 
else
  aws iam create-login-profile --user-name "${USER_NAME}" --password "${TEMP_PASSWORD}" --password-reset-required >/dev/null
  echo "Created login profile." 
fi

echo "Console sign-in (option A): https://${ACCOUNT_ID}.signin.aws.amazon.com/console/"
echo "Console sign-in (option B): https://signin.aws.amazon.com/console (choose 'IAM user', enter Account ID)"
echo "Username: ${USER_NAME}"
echo "Temp password: ${TEMP_PASSWORD}"

echo
echo "Verify:"
echo "  aws iam list-attached-user-policies --user-name ${USER_NAME} --no-cli-pager"
echo "  aws iam get-login-profile --user-name ${USER_NAME} --no-cli-pager"
