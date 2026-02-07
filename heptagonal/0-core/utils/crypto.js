// Cryptography Utilities
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

// Password hashing
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Generate secure random token
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate UUID
export const generateUUID = () => {
  return crypto.randomUUID();
};

// Encrypt data
export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// Decrypt data
export const decrypt = ({ encrypted, iv, authTag }) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Hash data (one-way)
export const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// HMAC signature
export const sign = (data, secret = ENCRYPTION_KEY) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

export const verify = (data, signature, secret = ENCRYPTION_KEY) => {
  const expected = sign(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

export default {
  hashPassword,
  comparePassword,
  generateToken,
  generateUUID,
  encrypt,
  decrypt,
  hash,
  sign,
  verify
};
