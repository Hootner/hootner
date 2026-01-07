// Minimal Password Manager - Secure credential storage
class PasswordManager {
  constructor(masterPassword) {
    this.masterPassword = this.hash(masterPassword);
    this.vault = new Map();
    this.locked = false;
  }

  // Unlock vault
  unlock(masterPassword) {
    if (this.hash(masterPassword) !== this.masterPassword) {
      throw new Error('Invalid master password');
    }
    this.locked = false;
    console.log('✓ Vault unlocked');
  }

  // Lock vault
  lock() {
    this.locked = true;
    console.log('✓ Vault locked');
  }

  // Add password
  add(service, username, password) {
    if (this.locked) throw new Error('Vault is locked');

    const entry = {
      service,
      username,
      password: this.encrypt(password),
      created: Date.now(),
      modified: Date.now()
    };

    this.vault.set(service, entry);
    console.log(`✓ Password saved for ${service}`);
  }

  // Get password
  get(service) {
    if (this.locked) throw new Error('Vault is locked');

    const entry = this.vault.get(service);
    if (!entry) return null;

    return {
      service: entry.service,
      username: entry.username,
      password: this.decrypt(entry.password)
    };
  }

  // Update password
  update(service, newPassword) {
    if (this.locked) throw new Error('Vault is locked');

    const entry = this.vault.get(service);
    if (!entry) throw new Error('Service not found');

    entry.password = this.encrypt(newPassword);
    entry.modified = Date.now();
    console.log(`✓ Password updated for ${service}`);
  }

  // Delete password
  delete(service) {
    if (this.locked) throw new Error('Vault is locked');

    this.vault.delete(service);
    console.log(`✓ Password deleted for ${service}`);
  }

  // List services
  list() {
    if (this.locked) throw new Error('Vault is locked');

    return Array.from(this.vault.values()).map(e => ({
      service: e.service,
      username: e.username,
      modified: new Date(e.modified).toISOString()
    }));
  }

  // Generate strong password
  generate(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  }

  // Simple encryption (use AES in production)
  encrypt(text) {
    return Buffer.from(text).toString('base64');
  }

  decrypt(encrypted) {
    return Buffer.from(encrypted, 'base64').toString('utf8');
  }

  hash(text) {
    // Simple hash (use bcrypt in production)
    return text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(36);
  }

  // Export vault (encrypted)
  export() {
    if (this.locked) throw new Error('Vault is locked');

    const data = Array.from(this.vault.entries());
    return JSON.stringify(data);
  }

  // Import vault
  import(data) {
    if (this.locked) throw new Error('Vault is locked');

    const entries = JSON.parse(data);
    this.vault = new Map(entries);
    console.log(`✓ Imported ${entries.length} entries`);
  }
}

// Demo
console.log('=== Password Manager Demo ===\n');

const pm = new PasswordManager('master123');

// Unlock
console.log('--- Unlock Vault ---');
pm.unlock('master123');

// Add passwords
console.log('\n--- Add Passwords ---');
pm.add('github.com', 'alice@example.com', 'gh_secret123');
pm.add('gmail.com', 'alice@example.com', 'email_pass456');

// Generate strong password
console.log('\n--- Generate Password ---');
const strong = pm.generate(20);
console.log(`Generated: ${strong}`);
pm.add('bank.com', 'alice', strong);

// List services
console.log('\n--- List Services ---');
pm.list().forEach(entry => {
  console.log(`${entry.service} (${entry.username})`);
});

// Get password
console.log('\n--- Get Password ---');
const github = pm.get('github.com');
console.log(`GitHub: ${github.username} / ${github.password}`);

// Update password
console.log('\n--- Update Password ---');
pm.update('github.com', 'new_gh_secret789');

// Lock vault
console.log('\n--- Lock Vault ---');
pm.lock();

// Try to access (should fail)
try {
  pm.get('github.com');
} catch (error) {
  console.log(`✗ ${error.message}`);
}

export default PasswordManager;
