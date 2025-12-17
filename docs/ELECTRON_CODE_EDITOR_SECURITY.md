# Security & Compliance Documentation

## 🔒 Security Features

### 1. Encryption Hardening

#### PBKDF2 Key Derivation

- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (OWASP recommended)
- **Salt**: 16-byte random salt per encryption
- **Key Length**: 256-bit AES-GCM

#### Auto-Encrypted Backups

```javascript
// Set backup password
localStorage.setItem('hootner_backup_password', 'your-password');

// Backups auto-encrypt on save
await securityCompliance.encryptBackup('your-password');

// Decrypt backup
const data = await securityCompliance.decryptBackup('your-password');
```

#### Encryption Details

- **Algorithm**: AES-GCM (Authenticated Encryption)
- **IV**: 12-byte random initialization vector
- **Storage**: Encrypted data stored in localStorage
- **Protection**: Password-based encryption with PBKDF2

### 2. Audit Logging

#### Log Structure

```json
{
  "id": 1234567890.123,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "action": "file_created",
  "user": "john.doe",
  "details": { "filename": "app.js" },
  "ip": "localhost"
}
```

#### Tracked Actions

- `file_created` - New file creation
- `file_deleted` - File deletion
- `code_executed` - Code execution
- `state_saved` - State persistence
- `backup_encrypted` - Backup encryption
- `backup_decrypted` - Backup decryption
- `role_changed` - User role change
- `splunk_export` - Log export to Splunk

#### Export Formats

**CSV Export**:

```javascript
securityCompliance.exportLogsCSV({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  user: 'john.doe',
  action: 'file_created',
});
```

**JSON Export**:

```javascript
securityCompliance.exportLogsJSON({
  startDate: '2024-01-01',
  user: 'john.doe',
});
```

#### Splunk Integration

```javascript
await securityCompliance.sendToSplunk(logs, {
  url: 'https://splunk.example.com:8088/services/collector',
  token: 'your-hec-token',
});
```

### 3. RBAC (Role-Based Access Control)

#### Available Roles

**Admin**:

- Permissions: `read`, `write`, `delete`, `audit`, `admin`
- Description: Full access to all features
- Use Case: System administrators

**Editor**:

- Permissions: `read`, `write`
- Description: Can read and edit files
- Use Case: Developers

**Viewer**:

- Permissions: `read`
- Description: Can view files only (read-only editor)
- Use Case: Code reviewers

**Guest**:

- Permissions: `read`, `preview`
- Description: View-only with preview access
- Use Case: External stakeholders

#### Setting Roles

```javascript
// Set user role
securityCompliance.setUserRole('viewer');

// Check permission
if (securityCompliance.hasPermission('write')) {
  // Allow write operation
}

// Get current role
const role = securityCompliance.getCurrentRole();
```

#### Role Restrictions

**Viewer/Guest Roles**:

- Editor set to read-only mode
- Write buttons disabled
- File creation/deletion blocked
- Save operations prevented

**Guest Role Additional**:

- Only preview icon visible in activity bar
- All other features hidden
- Preview-only access

## 🛡️ Security Best Practices

### Password Requirements

- Minimum 8 characters
- Use strong, unique passwords
- Store securely (not in code)
- Rotate regularly

### Backup Security

1. Set backup password via command palette
2. Backups auto-encrypt on save
3. Store password securely (password manager)
4. Test decryption regularly

### Audit Log Management

- Logs stored in localStorage (max 1000)
- Export regularly for archival
- Filter by date/user/action
- Integrate with SIEM (Splunk)

### Access Control

- Assign minimum required role
- Review permissions regularly
- Use guest role for external access
- Audit role changes

## 📊 Security Dashboard

### View Security Status

```javascript
const status = securityCompliance.getSecurityStatus();
// Returns:
// {
//   encryptionEnabled: true,
//   auditLogsCount: 245,
//   currentRole: 'editor',
//   lastBackup: '2024-01-15T10:30:00.000Z',
//   recentActions: [...]
// }
```

### Command Palette Commands

- `Security: Export Audit Logs` - Export logs as CSV/JSON
- `Security: Encrypt Backup` - Encrypt current state
- `Security: Set Role` - Change user role
- `Security: Status` - View security dashboard

## 🔐 Compliance Features

### Data Protection

- ✅ Encryption at rest (AES-256-GCM)
- ✅ PBKDF2 key derivation
- ✅ Secure password storage
- ✅ Auto-encrypted backups

### Audit Trail

- ✅ Comprehensive logging
- ✅ Timestamp tracking
- ✅ User attribution
- ✅ Action details
- ✅ Export capabilities

### Access Control

- ✅ Role-based permissions
- ✅ Granular access levels
- ✅ Read-only modes
- ✅ Guest access

### Compliance Standards

- **GDPR**: Data encryption, audit logs
- **HIPAA**: Access controls, audit trails
- **SOC 2**: Security monitoring, logging
- **ISO 27001**: Information security management

## 🚀 Quick Start

### 1. Set Up Encryption

```javascript
// Via command palette: Ctrl+Shift+P
// Type: "Security: Encrypt Backup"
// Enter password when prompted
```

### 2. Configure Role

```javascript
// Via command palette: Ctrl+Shift+P
// Type: "Security: Set Role"
// Choose: admin, editor, viewer, or guest
```

### 3. Export Audit Logs

```javascript
// Via command palette: Ctrl+Shift+P
// Type: "Security: Export Audit Logs"
// Choose format: csv or json
```

### 4. View Security Status

```javascript
// Via command palette: Ctrl+Shift+P
// Type: "Security: Status"
// View in output panel
```

## 📝 API Reference

### SecurityCompliance Class

#### Methods

**Encryption**:

- `deriveKey(password, salt)` - Derive encryption key
- `encrypt(data, password)` - Encrypt data
- `decrypt(encryptedData, password)` - Decrypt data
- `encryptBackup(password)` - Encrypt state backup
- `decryptBackup(password)` - Decrypt state backup

**Audit Logging**:

- `logAudit(action, details)` - Log an action
- `exportLogsCSV(filters)` - Export logs as CSV
- `exportLogsJSON(filters)` - Export logs as JSON
- `filterLogs(filters)` - Filter logs by criteria
- `sendToSplunk(logs, config)` - Send to Splunk

**RBAC**:

- `setUserRole(role)` - Set user role
- `getCurrentRole()` - Get current role
- `hasPermission(action)` - Check permission
- `applyRoleRestrictions(role)` - Apply UI restrictions

**Utilities**:

- `getSecurityStatus()` - Get security dashboard
- `clearSecurityData()` - Clear sensitive data

## ⚠️ Security Warnings

1. **Password Storage**: Never store passwords in code or localStorage
2. **Backup Password**: Store securely in password manager
3. **Audit Logs**: Export regularly to prevent data loss
4. **Role Changes**: Require page reload to take effect
5. **Encryption**: Test decryption before relying on backups

## 🔧 Troubleshooting

### Decryption Failed

- Verify password is correct
- Check backup exists in localStorage
- Ensure backup wasn't corrupted

### Permission Denied

- Check current role: `securityCompliance.getCurrentRole()`
- Verify required permission exists
- Contact admin to change role

### Audit Logs Missing

- Check localStorage: `hootner_audit_logs`
- Verify logs weren't cleared
- Export logs regularly to prevent loss

---

**Made with 🦉 by the HOOTNER Team**
