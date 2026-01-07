#!/usr/bin/env node
/**
 * Layer 11: Blockchain - Distributed ledger with consensus
 * Dependencies: Layer 0 (Hash), Layer 5 (P2P Network), Layer 6 (Database)
 */

class Blockchain {
  constructor(difficulty = 2) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  // Create genesis block
  createGenesisBlock() {
    return new Block(0, Date.now(), [], '0');
  }

  // Get latest block
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Mine pending transactions
  minePendingTransactions(miningRewardAddress) {
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    
    console.log(`[MINING] Block ${block.index}...`);
    block.mineBlock(this.difficulty);
    
    this.chain.push(block);
    
    // Reward miner
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
    
    console.log(`[MINED] Block ${block.index} with hash ${block.hash.slice(0, 10)}...`);
  }

  // Add transaction
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }
    
    this.pendingTransactions.push(transaction);
    console.log(`[TX] ${transaction.fromAddress} -> ${transaction.toAddress}: ${transaction.amount}`);
  }

  // Get balance
  getBalance(address) {
    let balance = 0;
    
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address) {
          balance -= tx.amount;
        }
        if (tx.toAddress === address) {
          balance += tx.amount;
        }
      }
    }
    
    return balance;
  }

  // Validate chain
  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Check hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      
      // Check previous hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      
      // Check proof of work
      if (!currentBlock.hash.startsWith('0'.repeat(this.difficulty))) {
        return false;
      }
    }
    
    return true;
  }
}

// Block class
class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  // Calculate hash
  calculateHash() {
    const data = this.index + this.previousHash + this.timestamp +
                 JSON.stringify(this.transactions) + this.nonce;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  // Mine block (proof of work)
  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    
    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

// Transaction class
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }
}

// Demo
if (require.main === module) {
  console.log('=== Blockchain Demo ===\n');
  
  const blockchain = new Blockchain(2);
  
  console.log('Mining block 1...');
  blockchain.addTransaction(new Transaction('alice', 'bob', 50));
  blockchain.addTransaction(new Transaction('bob', 'charlie', 25));
  blockchain.minePendingTransactions('miner1');
  
  console.log();
  
  console.log('Mining block 2...');
  blockchain.addTransaction(new Transaction('charlie', 'alice', 10));
  blockchain.minePendingTransactions('miner1');
  
  console.log();
  
  // Check balances
  console.log('Balances:');
  console.log(`  Alice: ${blockchain.getBalance('alice')}`);
  console.log(`  Bob: ${blockchain.getBalance('bob')}`);
  console.log(`  Charlie: ${blockchain.getBalance('charlie')}`);
  console.log(`  Miner1: ${blockchain.getBalance('miner1')}`);
  
  console.log();
  
  // Validate
  console.log('Chain valid:', blockchain.isValid());
  
  console.log('\nChain length:', blockchain.chain.length);
}

module.exports = { Blockchain, Block, Transaction };
