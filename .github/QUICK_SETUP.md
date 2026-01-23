# GitHub Settings Quick Setup Guide

## 🚀 Step-by-Step Configuration

### 1️⃣ Generate Secrets (5 min)

```bash
node .github/scripts/generate-secrets.js
```

Copy output to password manager.

### 2️⃣ Configure Branch Protection (10 min)

**URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/branches`

Click "Add branch protection rule":

**Pattern**: `main`

- ✅ Require pull request (2 approvals)
- ✅ Require status checks: `e2e-test`, `container-scan`
- ✅ Require conversation resolution
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

### 3️⃣ Add Secrets (15 min)

**URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Click "New repository secret" for each:

**Required**:

- `JWT_SECRET` - From generate-secrets.js
- `JWT_REFRESH_SECRET` - From generate-secrets.js
- `AWS_ACCESS_KEY_ID` - Your AWS key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret

**Optional**:

- `COSIGN_PASSWORD` - From generate-secrets.js
- `MONGODB_URI` - Your MongoDB connection
- `REDIS_URL` - Your Redis connection

### 4️⃣ Enable Security Features (5 min)

**URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/security_analysis`

- ✅ Dependency graph
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Secret scanning
- ✅ Push protection

### 5️⃣ Configure Actions (3 min)

**URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/actions`

- Select: "Allow select actions"
- Add: `actions/*, docker/*, aws-actions/*, aquasecurity/*, github/*`

### 6️⃣ Create Environments (10 min)

**URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/environments`

**Production**:

- Required reviewers: 2
- Deployment branches: `main` only

**Staging**:

- Required reviewers: 1
- Deployment branches: `main`, `develop`

---

## ✅ Verification

Run workflows to test:

```bash
git checkout -b test/github-config
git commit --allow-empty -m "test: verify GitHub settings"
git push origin test/github-config
```

Create PR and verify:

- Status checks run
- Approval required
- No secrets in logs

---

**Total Time**: ~45 minutes
