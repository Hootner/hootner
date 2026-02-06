# GitHub Repository Settings Checklist

This checklist covers settings that must be configured in the GitHub web interface.

## 🔐 Security & Analysis

### Dependency Graph

- [ ] **Enable dependency graph** (Settings → Security → Code security and analysis)

### Dependabot

- [x] **Dependabot alerts**: Enabled (via dependabot.yml)
- [x] **Dependabot security updates**: Enabled (via dependabot.yml)
- [ ] **Grouped security updates**: Enable for easier management

### Code Scanning

- [ ] **CodeQL analysis**: Enable default setup
  - Languages: JavaScript, TypeScript, Python, Go
  - Schedule: On push to main/develop
- [ ] **Third-party scanning**: Consider Snyk or SonarCloud integration

### Secret Scanning

- [ ] **Secret scanning**: Enable
- [ ] **Push protection**: Enable (prevents committing secrets)
- [ ] **Validity checks**: Enable (verifies if secrets are active)

## 🌿 Branch Protection Rules

### Main Branch (`main`)

Navigate to: Settings → Branches → Add branch protection rule

**Branch name pattern**: `main`

#### Protect matching branches

- [ ] **Require a pull request before merging**
  - [ ] Require approvals: **2**
  - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners
  - [ ] Restrict who can dismiss pull request reviews
  - [ ] Allow specified actors to bypass required pull requests

- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging
  - **Required status checks**:
    - [ ] `e2e-test`
    - [ ] `container-scan`
    - [ ] `api-contract-test`
    - [ ] `backup-verification`
    - [ ] `license-check`

- [ ] **Require conversation resolution before merging**

- [ ] **Require signed commits**

- [ ] **Require linear history**

- [ ] **Require deployments to succeed before merging**
  - Environments: `staging`

#### Rules applied to everyone including administrators

- [ ] **Include administrators**

#### Restrict who can push to matching branches

- [ ] **Restrict pushes that create matching branches**
  - Allowed actors: `@hootner-team/maintainers`

#### Additional settings

- [ ] **Allow force pushes**: **NO**
- [ ] **Allow deletions**: **NO**

### Develop Branch (`develop`)

**Branch name pattern**: `develop`

- [ ] **Require a pull request before merging**
  - [ ] Require approvals: **1**
- [ ] **Require status checks to pass before merging**
  - Same checks as main branch
- [ ] **Require conversation resolution before merging**

## 🔑 Secrets and Variables

Navigate to: Settings → Secrets and variables → Actions

### Repository Secrets (Required)

#### AWS Credentials

- [ ] `AWS_ACCESS_KEY_ID` - AWS access key for deployments
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key
- [ ] `AWS_REGION` - Default: `us-east-2`

#### Database

- [ ] `MONGODB_URI` - Production MongoDB connection string
- [ ] `MONGODB_URI_TEST` - Test database connection string
- [ ] `REDIS_URL` - Redis connection string

#### Authentication

- [ ] `JWT_SECRET` - Minimum 32 characters, cryptographically random
- [ ] `JWT_REFRESH_SECRET` - Separate secret for refresh tokens

#### Container Registry

- [ ] `GHCR_TOKEN` - GitHub Container Registry token (or use `GITHUB_TOKEN`)
- [ ] `DOCKER_USERNAME` - Docker Hub username (if using)
- [ ] `DOCKER_PASSWORD` - Docker Hub password (if using)

#### Security

- [ ] `COSIGN_PASSWORD` - For container image signing
- [ ] `SNYK_TOKEN` - Snyk API token for security scanning

#### Notifications (Optional)

- [ ] `SLACK_WEBHOOK` - Slack webhook for notifications
- [ ] `DISCORD_WEBHOOK` - Discord webhook for notifications

#### Stripe (if using payments)

- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

### Repository Variables

- [ ] `COST_THRESHOLD` - AWS cost alert threshold (default: 1000)
- [ ] `ALERT_THRESHOLD` - Budget alert percentage (default: 80)
- [ ] `BACKUP_BUCKET` - S3 bucket for backups (default: hootner-backups)

## ⚙️ General Settings

### General

- [ ] **Repository name**: `hootner` or `my-local-repo`
- [ ] **Description**: "Enterprise-grade video streaming platform with PWA capabilities"
- [ ] **Website**: https://hootner.com
- [ ] **Topics**: `video-streaming`, `pwa`, `microservices`, `kubernetes`, `chaos-engineering`
- [ ] **Include in the home page**: Yes
- [ ] **Releases**: Yes
- [ ] **Packages**: Yes
- [ ] **Deployments**: Yes
- [ ] **Environments**: Yes

### Features

- [ ] **Wikis**: Optional
- [ ] **Issues**: Yes
- [ ] **Sponsorships**: Optional
- [ ] **Preserve this repository**: Optional
- [ ] **Discussions**: Optional (recommended for community)

### Pull Requests

- [ ] **Allow merge commits**: Yes
- [ ] **Allow squash merging**: Yes (recommended)
- [ ] **Allow rebase merging**: Yes
- [ ] **Always suggest updating pull request branches**: Yes
- [ ] **Allow auto-merge**: Yes
- [ ] **Automatically delete head branches**: Yes

### Archives

- [ ] **Include Git LFS objects in archives**: If using LFS

## 🚀 Actions Settings

Navigate to: Settings → Actions → General

### Actions permissions

- [ ] **Allow all actions and reusable workflows**: OR
- [x] **Allow select actions and reusable workflows** (recommended)
  - [ ] Allow actions created by GitHub
  - [ ] Allow actions by Marketplace verified creators
  - [ ] Allow specified actions and reusable workflows:
    ```
    actions/*,
    docker/*,
    aws-actions/*,
    aquasecurity/*,
    github/*
    ```

### Workflow permissions

- [x] **Read repository contents and packages permissions** (default)
- [ ] **Read and write permissions** (if needed for auto-commits)

### Fork pull request workflows

- [ ] **Require approval for first-time contributors**
- [ ] **Require approval for all outside collaborators**

## 🌍 Environments

Navigate to: Settings → Environments

### Production Environment

- [ ] **Name**: `production`
- [ ] **Required reviewers**: `@hootner-team/maintainers` (2 required)
- [ ] **Wait timer**: 0 minutes
- [ ] **Deployment branches**: `main` only
- [ ] **Environment secrets**: Production-specific secrets

### Staging Environment

- [ ] **Name**: `staging`
- [ ] **Required reviewers**: `@hootner-team/developers` (1 required)
- [ ] **Wait timer**: 0 minutes
- [ ] **Deployment branches**: `main`, `develop`
- [ ] **Environment secrets**: Staging-specific secrets

### Preview Environment

- [ ] **Name**: `preview`
- [ ] **Required reviewers**: None
- [ ] **Deployment branches**: All branches
- [ ] **Environment secrets**: Preview-specific secrets

## 📊 Insights & Analytics

### Pulse

- [ ] Review weekly activity

### Contributors

- [ ] Verify contributor graph

### Traffic

- [ ] Monitor views and clones

### Dependency graph

- [ ] Review dependencies
- [ ] Check for vulnerabilities

## 🔔 Notifications

### Watching

- [ ] Set repository watch preferences for team members

### Email notifications

- [ ] Configure email preferences for:
  - [ ] Security alerts
  - [ ] Dependabot alerts
  - [ ] Actions workflow failures
  - [ ] Pull request reviews

## 📝 Webhooks (Optional)

Navigate to: Settings → Webhooks

### Slack Integration

- [ ] **Payload URL**: Your Slack webhook URL
- [ ] **Content type**: application/json
- [ ] **Events**: Push, Pull request, Issues, Deployment

### Discord Integration

- [ ] **Payload URL**: Your Discord webhook URL
- [ ] **Content type**: application/json
- [ ] **Events**: Push, Pull request, Issues

## ✅ Verification Steps

After configuration:

1. **Test branch protection**:

   ```bash
   git checkout main
   git commit --allow-empty -m "test: branch protection"
   git push origin main  # Should fail
   ```

2. **Test PR workflow**:
   - Create a feature branch
   - Make changes
   - Open PR
   - Verify required checks run
   - Verify approval requirements

3. **Test secrets**:
   - Trigger a workflow that uses secrets
   - Verify no secrets are exposed in logs

4. **Test Dependabot**:
   - Wait for weekly run or trigger manually
   - Verify PRs are created

5. **Test security scanning**:
   - Push code with a known vulnerability
   - Verify alert is created

## 📅 Maintenance Schedule

- **Weekly**: Review Dependabot PRs
- **Monthly**: Review security alerts
- **Quarterly**: Audit access permissions
- **Annually**: Review and update this checklist

---

**Last Updated**: 2024-01-01
**Checklist Version**: 1.0
