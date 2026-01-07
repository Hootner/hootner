// Minimal STM - Software Transactional Memory, ACID
class TVar {
  constructor(value) {
    this.value = value;
    this.version = 0;
  }
}

class Transaction {
  constructor() {
    this.readSet = new Map();
    this.writeSet = new Map();
    this.valid = true;
  }

  read(tvar) {
    if (this.writeSet.has(tvar)) {
      return this.writeSet.get(tvar);
    }

    if (!this.readSet.has(tvar)) {
      this.readSet.set(tvar, { value: tvar.value, version: tvar.version });
    }

    return this.readSet.get(tvar).value;
  }

  write(tvar, value) {
    this.writeSet.set(tvar, value);
  }

  validate() {
    for (const [tvar, snapshot] of this.readSet) {
      if (tvar.version !== snapshot.version) {
        return false;
      }
    }
    return true;
  }

  commit() {
    if (!this.validate()) {
      throw new Error('Transaction conflict - retry');
    }

    for (const [tvar, value] of this.writeSet) {
      tvar.value = value;
      tvar.version++;
    }

    return true;
  }
}

class STM {
  static atomically(fn, maxRetries = 10) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const tx = new Transaction();

      try {
        const result = fn(tx);
        tx.commit();
        return result;
      } catch (error) {
        if (error.message.includes('retry')) {
          console.log(`Retry attempt ${attempt + 1}`);
          continue;
        }
        throw error;
      }
    }

    throw new Error('Transaction failed after max retries');
  }

  static newTVar(value) {
    return new TVar(value);
  }
}

// Demo: Bank transfer
console.log('=== Software Transactional Memory Demo ===\n');

const account1 = STM.newTVar(1000);
const account2 = STM.newTVar(500);

console.log('Initial balances:');
console.log('Account 1:', account1.value);
console.log('Account 2:', account2.value);

// Transfer money atomically
console.log('\n--- Transfer $200 from Account 1 to Account 2 ---');
STM.atomically(tx => {
  const balance1 = tx.read(account1);
  const balance2 = tx.read(account2);

  if (balance1 < 200) {
    throw new Error('Insufficient funds');
  }

  tx.write(account1, balance1 - 200);
  tx.write(account2, balance2 + 200);

  console.log('Transaction executing...');
});

console.log('\nFinal balances:');
console.log('Account 1:', account1.value);
console.log('Account 2:', account2.value);

// Concurrent transfers (simulated)
console.log('\n--- Concurrent transfers ---');
const account3 = STM.newTVar(1000);

try {
  STM.atomically(tx => {
    const balance = tx.read(account3);
    tx.write(account3, balance - 100);
  });

  STM.atomically(tx => {
    const balance = tx.read(account3);
    tx.write(account3, balance - 200);
  });

  console.log('Account 3 final:', account3.value);
} catch (error) {
  console.error('Error:', error.message);
}

export default STM;
