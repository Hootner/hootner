#!/usr/bin/env node
/**
 * Layer 11: Encryption - Cryptographic algorithms
 * Dependencies: Layer 0 (Binary, Math)
 */

class Encryption {
  // Simple substitution cipher (Caesar)
  static caesar(text, shift) {
    return text.split('').map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    }).join('');
  }

  // XOR cipher
  static xor(text, key) {
    return text.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  }

  // Simple hash function
  static hash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  // Generate key pair (simplified RSA-like)
  static generateKeyPair() {
    const p = 61;
    const q = 53;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    const e = 17;
    
    // Find d (modular inverse)
    let d = 1;
    while ((d * e) % phi !== 1) {
      d++;
    }
    
    console.log('[KEYGEN] Generated key pair');
    return {
      publicKey: { e, n },
      privateKey: { d, n }
    };
  }

  // RSA encrypt (simplified)
  static rsaEncrypt(message, publicKey) {
    const { e, n } = publicKey;
    const encrypted = [];
    
    for (let i = 0; i < message.length; i++) {
      const m = message.charCodeAt(i);
      const c = this.modPow(m, e, n);
      encrypted.push(c);
    }
    
    return encrypted;
  }

  // RSA decrypt (simplified)
  static rsaDecrypt(encrypted, privateKey) {
    const { d, n } = privateKey;
    let decrypted = '';
    
    for (const c of encrypted) {
      const m = this.modPow(c, d, n);
      decrypted += String.fromCharCode(m);
    }
    
    return decrypted;
  }

  // Modular exponentiation
  static modPow(base, exp, mod) {
    let result = 1;
    base = base % mod;
    
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod;
      }
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    
    return result;
  }

  // AES-like block cipher (simplified)
  static blockCipher(block, key, encrypt = true) {
    const rounds = 4;
    let state = block;
    
    for (let i = 0; i < rounds; i++) {
      // Substitute
      state = state.split('').map(c =>
        String.fromCharCode((c.charCodeAt(0) + key.charCodeAt(i % key.length)) % 256)
      ).join('');
      
      // Permute
      if (encrypt) {
        state = state.split('').reverse().join('');
      }
    }
    
    return state;
  }

  // HMAC (simplified)
  static hmac(message, key) {
    const innerPad = key + 'inner';
    const outerPad = key + 'outer';
    
    const innerHash = this.hash(innerPad + message);
    const outerHash = this.hash(outerPad + innerHash);
    
    return outerHash;
  }

  // Digital signature
  static sign(message, privateKey) {
    const messageHash = this.hash(message);
    const signature = this.rsaEncrypt(messageHash, { e: privateKey.d, n: privateKey.n });
    console.log('[SIGN] Message signed');
    return signature;
  }

  // Verify signature
  static verify(message, signature, publicKey) {
    const messageHash = this.hash(message);
    const decrypted = this.rsaDecrypt(signature, { d: publicKey.e, n: publicKey.n });
    const valid = messageHash === decrypted;
    console.log('[VERIFY] Signature', valid ? 'valid' : 'invalid');
    return valid;
  }
}

// Demo
if (require.main === module) {
  console.log('=== Encryption Demo ===\n');
  
  // Caesar cipher
  const text1 = 'HELLO';
  const encrypted1 = Encryption.caesar(text1, 3);
  console.log(`Caesar: ${text1} -> ${encrypted1}`);
  const decrypted1 = Encryption.caesar(encrypted1, -3);
  console.log(`Decrypted: ${decrypted1}\n`);
  
  // XOR cipher
  const text2 = 'secret';
  const key2 = 'key';
  const encrypted2 = Encryption.xor(text2, key2);
  console.log(`XOR: ${text2} -> [encrypted]`);
  const decrypted2 = Encryption.xor(encrypted2, key2);
  console.log(`Decrypted: ${decrypted2}\n`);
  
  // Hash
  const hash = Encryption.hash('password123');
  console.log(`Hash: ${hash}\n`);
  
  // RSA
  const { publicKey, privateKey } = Encryption.generateKeyPair();
  const message = 'Hi';
  const encrypted3 = Encryption.rsaEncrypt(message, publicKey);
  console.log(`RSA encrypted: [${encrypted3.length} blocks]`);
  const decrypted3 = Encryption.rsaDecrypt(encrypted3, privateKey);
  console.log(`Decrypted: ${decrypted3}\n`);
  
  // HMAC
  const hmac = Encryption.hmac('message', 'secret');
  console.log(`HMAC: ${hmac}\n`);
  
  // Digital signature
  const signature = Encryption.sign('document', privateKey);
  Encryption.verify('document', signature, publicKey);
}

module.exports = Encryption;
