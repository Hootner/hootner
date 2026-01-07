// Minimal Zero-Knowledge Proof - Commitment, Challenge, Response
class ZKProof {
  constructor() {
    this.prime = 23; // Small prime for demo
  }

  // Modular exponentiation
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

  // Prover knows secret x, wants to prove knowledge without revealing x
  createCommitment(secret, generator = 5) {
    const r = Math.floor(Math.random() * (this.prime - 1)) + 1;
    const commitment = this.modPow(generator, r, this.prime);
    return { commitment, r, generator };
  }

  // Verifier sends challenge
  createChallenge() {
    return Math.floor(Math.random() * 2); // 0 or 1
  }

  // Prover responds to challenge
  respond(secret, commitment, challenge) {
    if (challenge === 0) {
      return { type: 'reveal_r', value: commitment.r };
    } else {
      return { type: 'reveal_secret', value: (commitment.r + secret) % (this.prime - 1) };
    }
  }

  // Verifier checks response
  verify(commitment, challenge, response, publicValue) {
    const { generator } = commitment;
    
    if (challenge === 0) {
      // Check commitment = g^r
      const expected = this.modPow(generator, response.value, this.prime);
      return expected === commitment.commitment;
    } else {
      // Check g^response = commitment * publicValue
      const left = this.modPow(generator, response.value, this.prime);
      const right = (commitment.commitment * publicValue) % this.prime;
      return left === right;
    }
  }
}

// Schnorr Protocol for discrete log
class SchnorrProof {
  constructor(prime = 23, generator = 5) {
    this.p = prime;
    this.g = generator;
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

  // Prover: knows x such that y = g^x mod p
  prove(secret) {
    // Public value
    const y = this.modPow(this.g, secret, this.p);
    
    // Commitment
    const r = Math.floor(Math.random() * (this.p - 1)) + 1;
    const t = this.modPow(this.g, r, this.p);
    
    // Challenge (simulated)
    const c = Math.floor(Math.random() * 10) + 1;
    
    // Response
    const s = (r + c * secret) % (this.p - 1);
    
    return { y, t, c, s };
  }

  // Verifier: check g^s = t * y^c
  verify(proof) {
    const left = this.modPow(this.g, proof.s, this.p);
    const right = (proof.t * this.modPow(proof.y, proof.c, this.p)) % this.p;
    return left === right;
  }
}

// Demo
console.log('=== Zero-Knowledge Proof Demo ===\n');

console.log('--- Basic ZK Proof ---');
const zk = new ZKProof();
const secret = 7;
const generator = 5;

// Public value (known to verifier)
const publicValue = zk.modPow(generator, secret, zk.prime);
console.log('Public value:', publicValue);

// Proof protocol
const commitment = zk.createCommitment(secret, generator);
console.log('Commitment:', commitment.commitment);

const challenge = zk.createChallenge();
console.log('Challenge:', challenge);

const response = zk.respond(secret, commitment, challenge);
console.log('Response type:', response.type);

const valid = zk.verify(commitment, challenge, response, publicValue);
console.log('Proof valid:', valid);

console.log('\n--- Schnorr Protocol ---');
const schnorr = new SchnorrProof();
const mySecret = 6;

const proof = schnorr.prove(mySecret);
console.log('Proof generated');
console.log('Public value (y):', proof.y);

const isValid = schnorr.verify(proof);
console.log('Proof valid:', isValid);
console.log('Secret never revealed!');

export { ZKProof, SchnorrProof };
