# Security Policy

## 🔒 Security at HOOTNER

HOOTNER is built with enterprise-grade security as a core principle. Our platform includes:

- **USB Passkey Authentication** (FIDO2/WebAuthn)
- **Quantum-Resistant Encryption**
- **18 Dedicated Security & Compliance Agents**
- **Zero-Trust Architecture**
- **Automated Penetration Testing**
- **Real-Time Threat Detection**

## 📋 Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported | Notes |

```prompt

# Mitigate Security Vulnerabilities (HOOTNER)

Single source of truth (avoid duplicating policy text):

- Security policy: [SECURITY.md](../../SECURITY.md)
- Security contacts: [.github/SECURITY_CONTACTS.txt](../SECURITY_CONTACTS.txt)

## Task

Given a vulnerability report, scan output, or suspected weakness, produce a mitigation plan and (when asked) implement a minimal, safe fix.

## Rules

- Do not reproduce the full security policy in output; link to SECURITY.md instead.
- Never recommend reporting security issues via public GitHub issues.
- Avoid leaking secrets or sensitive data in logs, tests, or example payloads.
- Prefer targeted fixes with regression tests; avoid broad refactors.

## Inputs

- Vulnerability description and suspected root cause
- Affected component(s) / file paths
- Reproduction steps and environment
- Severity estimate (or enough info to assess it)

## Output format

1. Triage summary (component, likely CWE/OWASP class, severity rationale)
2. Reproduction + verification steps
3. Fix plan (short, ordered)
4. Patch checklist (authz, validation, logging, secrets, tests)
5. Communication guidance: reference SECURITY.md for responsible disclosure steps

```

1. [Step 1]

2. [Step 2]

3. [Step 3]
