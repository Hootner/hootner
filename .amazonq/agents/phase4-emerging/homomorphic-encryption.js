// Minimal Homomorphic Encryption - Compute on Encrypted Data
class HomomorphicEncryption {
  constructor() {
    this.publicKey = { n: 143, g: 144 }; // n = p*q (11*13)
    this.privateKey = { lambda: 60, mu: 119 }; // Simplified Paillier
  }

  // Encrypt plaintext
  encrypt(m) {
    const { n, g } = this.publicKey;
    const r = Math.floor(Math.random() * n) + 1;
    
    // c = g^m * r^n mod n^2
    const n2 = n * n;
    const gm = this.modPow(g, m, n2);
    const rn = this.modPow(r, n, n2);
    const c = (gm * rn) % n2;
    
    return c;
  }

  // Decrypt ciphertext
  decrypt(c) {
    const { n } = this.publicKey;
    const { lambda, mu } = this.privateKey;
    const n2 = n * n;
    
    // m = L(c^lambda mod n^2) * mu mod n
    const cl = this.modPow(c, lambda, n2);
    const l = Math.floor((cl - 1) / n);
    const m = (l * mu) % n;
    
    return m;
  }

  // Homomorphic addition: E(m1) * E(m2) = E(m1 + m2)
  add(c1, c2) {
    const n2 = this.publicKey.n * this.publicKey.n;
    return (c1 * c2) % n2;
  }

  // Homomorphic scalar multiplication: E(m)^k = E(k*m)
  multiply(c, k) {
    const n2 = this.publicKey.n * this.publicKey.n;
    return this.modPow(c, k, n2);
  }

  modPow(base, exp, mod) {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod;
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  }
}

// Demo
console.log('=== Homomorphic Encryption Demo ===\n');

const he = new HomomorphicEncryption();

// Encrypt two numbers
const m1 = 5;
const m2 = 3;

console.log(`Plaintext: ${m1}, ${m2}`);

const c1 = he.encrypt(m1);
const c2 = he.encrypt(m2);

console.log(`Encrypted: ${c1}, ${c2}`);

// Add encrypted numbers
console.log('\n--- Homomorphic Addition ---');
const cSum = he.add(c1, c2);
const sum = he.decrypt(cSum);
console.log(`E(${m1}) + E(${m2}) = E(${sum})`);
console.log(`Decrypted sum: ${sum} (expected: ${m1 + m2})`);

// Multiply encrypted number by scalar
console.log('\n--- Homomorphic Scalar Multiplication ---');
const k = 2;
const cMul = he.multiply(c1, k);
const product = he.decrypt(cMul);
console.log(`E(${m1}) * ${k} = E(${product})`);
console.log(`Decrypted product: ${product} (expected: ${m1 * k})`);

// Compute on encrypted data without decryption
console.log('\n--- Private Computation ---');
console.log('Server computes on encrypted data without seeing values!');

export default HomomorphicEncryption;
