// Minimal Authentication Server - OAuth2/OpenID Connect basics
class AuthServer {
  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.clients = new Map();
    this.authCodes = new Map();
  }

  // Register client application
  registerClient(clientId, redirectUri) {
    this.clients.set(clientId, { clientId, redirectUri, secret: this.generateSecret() });
    console.log(`Client registered: ${clientId}`);
    return this.clients.get(clientId);
  }

  // Register user
  registerUser(username, password) {
    const userId = Date.now().toString();
    this.users.set(username, { userId, username, password: this.hash(password) });
    console.log(`User registered: ${username}`);
    return userId;
  }

  // Login (Resource Owner Password Flow)
  login(username, password) {
    const user = this.users.get(username);
    if (!user || user.password !== this.hash(password)) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken();
    this.tokens.set(token, { userId: user.userId, username, expires: Date.now() + 3600000 });
    
    console.log(`✓ Login successful: ${username}`);
    return { access_token: token, token_type: 'Bearer', expires_in: 3600 };
  }

  // Authorization Code Flow - Step 1: Get auth code
  authorize(clientId, username, password) {
    const client = this.clients.get(clientId);
    if (!client) throw new Error('Invalid client');

    const user = this.users.get(username);
    if (!user || user.password !== this.hash(password)) {
      throw new Error('Invalid credentials');
    }

    const code = this.generateToken();
    this.authCodes.set(code, { clientId, userId: user.userId, expires: Date.now() + 60000 });
    
    console.log(`✓ Authorization code issued for ${username}`);
    return { code, redirect_uri: client.redirectUri };
  }

  // Authorization Code Flow - Step 2: Exchange code for token
  exchangeCode(clientId, clientSecret, code) {
    const client = this.clients.get(clientId);
    if (!client || client.secret !== clientSecret) {
      throw new Error('Invalid client');
    }

    const authCode = this.authCodes.get(code);
    if (!authCode || authCode.expires < Date.now()) {
      throw new Error('Invalid or expired code');
    }

    this.authCodes.delete(code);

    const token = this.generateToken();
    this.tokens.set(token, { userId: authCode.userId, clientId, expires: Date.now() + 3600000 });

    console.log(`✓ Access token issued`);
    return { access_token: token, token_type: 'Bearer', expires_in: 3600 };
  }

  // Validate token
  validateToken(token) {
    const tokenData = this.tokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return null;
    }
    return tokenData;
  }

  // Revoke token
  revokeToken(token) {
    this.tokens.delete(token);
    console.log(`✓ Token revoked`);
  }

  // Helpers
  generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  generateSecret() {
    return Math.random().toString(36).substring(2, 15);
  }

  hash(password) {
    // Simple hash (use bcrypt in production)
    return password.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(36);
  }
}

// Demo
console.log('=== Authentication Server Demo ===\n');

const auth = new AuthServer();

// Register client
console.log('--- Register Client ---');
const client = auth.registerClient('my-app', 'http://localhost:3000/callback');
console.log(`Client secret: ${client.secret}`);

// Register user
console.log('\n--- Register User ---');
auth.registerUser('alice', 'password123');

// Password flow
console.log('\n--- Password Flow ---');
const token1 = auth.login('alice', 'password123');
console.log(`Access token: ${token1.access_token.substring(0, 20)}...`);

// Validate token
console.log('\n--- Validate Token ---');
const valid = auth.validateToken(token1.access_token);
console.log(`Token valid: ${valid ? 'Yes' : 'No'}`);
console.log(`User: ${valid.username}`);

// Authorization code flow
console.log('\n--- Authorization Code Flow ---');
const authResult = auth.authorize('my-app', 'alice', 'password123');
console.log(`Auth code: ${authResult.code.substring(0, 20)}...`);

const token2 = auth.exchangeCode('my-app', client.secret, authResult.code);
console.log(`Access token: ${token2.access_token.substring(0, 20)}...`);

// Revoke
console.log('\n--- Revoke Token ---');
auth.revokeToken(token1.access_token);

export default AuthServer;
