#!/usr/bin/env node
/**
 * Layer 7: Authentication - User authentication and authorization
 * Dependencies: Layer 6 (Database, Cache), Layer 7 (Web Framework)
 */

class AuthSystem {
  constructor(db, secret = 'secret-key') {
    this.db = db;
    this.secret = secret;
    this.sessions = new Map();
    this.tokens = new Map();
  }

  // Hash password (simplified)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
    }
    return Math.abs(hash).toString(16);
  }

  // Verify password
  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  // Register user
  async register(username, password, email) {
    console.log(`[REGISTER] ${username}`);
    
    // Check if exists
    const existing = await this.db.findOne('users', { username });
    if (existing) {
      return { success: false, error: 'User already exists' };
    }
    
    // Hash password
    const passwordHash = this.hashPassword(password);
    
    // Create user
    const userId = await this.db.insert('users', {
      username,
      passwordHash,
      email,
      createdAt: Date.now()
    });
    
    return { success: true, userId };
  }

  // Login with password
  async login(username, password) {
    console.log(`[LOGIN] ${username}`);
    
    const user = await this.db.findOne('users', { username });
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    if (!this.verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Create session
    const sessionId = this.generateToken();
    this.sessions.set(sessionId, {
      userId: user.id,
      username: user.username,
      createdAt: Date.now()
    });
    
    console.log(`[SESSION] Created ${sessionId}`);
    
    return { success: true, sessionId, user: { id: user.id, username: user.username } };
  }

  // Logout
  logout(sessionId) {
    console.log(`[LOGOUT] ${sessionId}`);
    this.sessions.delete(sessionId);
  }

  // Verify session
  verifySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Check expiration (24 hours)
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    return session;
  }

  // Generate JWT (simplified)
  generateJWT(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const token = {
      header: Buffer.from(JSON.stringify(header)).toString('base64'),
      payload: Buffer.from(JSON.stringify(payload)).toString('base64'),
      signature: this.sign(payload)
    };
    
    return `${token.header}.${token.payload}.${token.signature}`;
  }

  // Verify JWT
  verifyJWT(token) {
    const [header, payload, signature] = token.split('.');
    
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // Verify signature
    if (this.sign(decoded) !== signature) {
      return null;
    }
    
    // Check expiration
    if (decoded.exp && Date.now() > decoded.exp) {
      return null;
    }
    
    return decoded;
  }

  // Sign payload
  sign(payload) {
    const data = JSON.stringify(payload) + this.secret;
    return this.hashPassword(data);
  }

  // Generate token
  generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // OAuth2 authorization code flow
  oauth2Authorize(clientId, redirectUri, scope) {
    console.log(`[OAUTH2] Authorize ${clientId}`);
    
    const code = this.generateToken();
    this.tokens.set(code, {
      clientId,
      redirectUri,
      scope,
      createdAt: Date.now()
    });
    
    return { code, redirectUri: `${redirectUri}?code=${code}` };
  }

  // OAuth2 token exchange
  oauth2Token(code, clientId, clientSecret) {
    console.log(`[OAUTH2] Token exchange`);
    
    const authCode = this.tokens.get(code);
    if (!authCode || authCode.clientId !== clientId) {
      return { error: 'Invalid code' };
    }
    
    // Generate access token
    const accessToken = this.generateJWT({
      clientId,
      scope: authCode.scope,
      exp: Date.now() + 3600000 // 1 hour
    });
    
    const refreshToken = this.generateToken();
    
    this.tokens.delete(code);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  // Middleware: Require authentication
  requireAuth(req, res) {
    const sessionId = req.headers['x-session-id'];
    const session = this.verifySession(sessionId);
    
    if (!session) {
      res.status = 401;
      res.json({ error: 'Unauthorized' });
      return false;
    }
    
    req.user = session;
    return true;
  }
}

// Demo
if (require.main === module) {
  // Mock database
  const mockDB = {
    users: [],
    nextId: 1,
    async findOne(table, query) {
      return this.users.find(u => u.username === query.username);
    },
    async insert(table, data) {
      const id = this.nextId++;
      this.users.push({ id, ...data });
      return id;
    }
  };
  
  const auth = new AuthSystem(mockDB, 'my-secret-key');
  
  console.log('=== Authentication Demo ===\n');
  
  (async () => {
    // Register
    const reg = await auth.register('alice', 'password123', 'alice@example.com');
    console.log('Registered:', reg.success, '\n');
    
    // Login
    const login = await auth.login('alice', 'password123');
    console.log('Login:', login.success);
    console.log('Session:', login.sessionId, '\n');
    
    // Verify session
    const session = auth.verifySession(login.sessionId);
    console.log('Session valid:', session !== null, '\n');
    
    // JWT
    const jwt = auth.generateJWT({ userId: 1, username: 'alice' });
    console.log('JWT:', jwt.slice(0, 50) + '...\n');
    
    const verified = auth.verifyJWT(jwt);
    console.log('JWT verified:', verified.username, '\n');
    
    // OAuth2
    const oauth = auth.oauth2Authorize('client-123', 'http://localhost/callback', 'read write');
    console.log('OAuth2 code:', oauth.code, '\n');
    
    const token = auth.oauth2Token(oauth.code, 'client-123', 'client-secret');
    console.log('Access token:', token.access_token.slice(0, 50) + '...');
  })();
}

module.exports = AuthSystem;
