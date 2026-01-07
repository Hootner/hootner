// Minimal Cryptocurrency - Blockchain, Mining, Transactions, Wallets
const crypto = require('crypto');

class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  hash() {
    return crypto.createHash('sha256')
      .update(this.from + this.to + this.amount + this.timestamp)
      .digest('hex');
  }
}

class Block {
  constructor(index, transactions, previousHash) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.createHash('sha256')
      .update(this.index + this.timestamp + JSON.stringify(this.transactions) + 
              this.previousHash + this.nonce)
      .digest('hex');
  }

  mine(difficulty) {
    const target = '0'.repeat(difficulty);
    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash} (nonce: ${this.nonce})`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 50;
    this.balances = new Map();
  }

  createGenesisBlock() {
    return new Block(0, [], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.from || !transaction.to) {
      throw new Error('Transaction must include from and to address');
    }

    const balance = this.getBalance(transaction.from);
    if (balance < transaction.amount) {
      throw new Error('Insufficient balance');
    }

    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(minerAddress) {
    // Add mining reward
    const rewardTx = new Transaction(null, minerAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      this.chain.length,
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mine(this.difficulty);
    this.chain.push(block);

    // Update balances
    this.pendingTransactions.forEach(tx => {
      if (tx.from) {
        this.balances.set(tx.from, (this.balances.get(tx.from) || 0) - tx.amount);
      }
      this.balances.set(tx.to, (this.balances.get(tx.to) || 0) + tx.amount);
    });

    this.pendingTransactions = [];
  }

  getBalance(address) {
    return this.balances.get(address) || 0;
  }

  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

// Demo: SimpleCoin
console.log('=== SimpleCoin Blockchain ===\n');

const coin = new Blockchain();

// Create wallets
const alice = 'alice_wallet_addr';
const bob = 'bob_wallet_addr';
const miner = 'miner_wallet_addr';

// Mine initial coins
console.log('Mining block 1...');
coin.minePendingTransactions(miner);
console.log(`Miner balance: ${coin.getBalance(miner)}\n`);

// Transactions
console.log('Adding transactions...');
coin.addTransaction(new Transaction(miner, alice, 20));
coin.addTransaction(new Transaction(miner, bob, 10));

console.log('Mining block 2...');
coin.minePendingTransactions(miner);

// Check balances
console.log('\n=== Balances ===');
console.log(`Alice: ${coin.getBalance(alice)}`);
console.log(`Bob: ${coin.getBalance(bob)}`);
console.log(`Miner: ${coin.getBalance(miner)}`);

console.log(`\nBlockchain valid: ${coin.isValid()}`);
console.log(`Total blocks: ${coin.chain.length}`);

module.exports = Blockchain;
