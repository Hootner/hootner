# AWS S3 Tables (Table Buckets) Setup

This repo supports configuring **S3 Tables (table buckets)** via environment variables.

## What the AWS Console is asking for

### 1) Table bucket name
- Must be **3–63 characters**
- Valid characters: **lowercase** `a-z`, digits `0-9`, and hyphen `-`
- Must be **unique within your AWS account for the Region**

Recommended naming pattern:
- `hootner-tables-${accountId}-${region}`

Example (us-east-1):
- `hootner-tables-123456789012-us-east-1`

Set in `.env`:
- `AWS_S3_TABLE_BUCKET_NAME=hootner-tables-123456789012-us-east-1`

### 2) Integration with AWS analytics services
In AWS, this is an **account + Region** integration that makes table buckets available to query engines like:
- Amazon Athena
- Amazon Redshift
- Amazon EMR
- Amazon SageMaker

When enabled, table buckets appear in **AWS Glue Data Catalog** under a catalog named:
- `s3tablescatalog`

In `.env`, this repo tracks the expected setting (informational/validation):
- `AWS_S3_TABLES_ANALYTICS_INTEGRATION_ENABLED=true`

### 3) Default storage class
This applies to **new tables** created in the table bucket (unless overridden per table).

Set one of:
- blank ("Don’t specify"; AWS defaults to Standard)
- `STANDARD`
- `INTELLIGENT_TIERING`

`.env`:
- `AWS_S3_TABLES_DEFAULT_STORAGE_CLASS=STANDARD`

### 4) Default encryption
If not specified, AWS defaults to **SSE-S3**.

Set one of:
- blank ("Don’t specify"; defaults to SSE-S3)
- `SSE-S3`
- `SSE-KMS` (requires a KMS key)

`.env`:
- `AWS_S3_TABLES_DEFAULT_ENCRYPTION=SSE-S3`
- `AWS_S3_TABLES_DEFAULT_ENCRYPTION=SSE-KMS`
- `AWS_S3_TABLES_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/…`

### 5) Tags (optional)
Format:
- `Key=Value,Key2=Value2` (max 50)

`.env`:
- `AWS_S3_TABLES_TAGS=Project=HOOTNER,Env=dev`

## Validation
Run:

```bash
node config/validate-config.js
```

This validates the name rules and checks your chosen storage class/encryption values.
