import crypto from 'crypto';

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }
    
    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.index + this.previousHash + this.timestamp + 
                    JSON.stringify(this.data) + this.nonce)
            .digest('hex');
    }
    
    mineBlock(difficulty) {
        const target = '0'.repeat(difficulty);
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }
    
    createGenesisBlock() {
        return new Block(0, Date.now(), 'Genesis Block', '0');
    }
    
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    
    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            data,
            this.getLatestBlock().hash
        );
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    
    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const previous = this.chain[i - 1];
            
            if (current.hash !== current.calculateHash()) {
                return false;
            }
            
            if (current.previousHash !== previous.hash) {
                return false;
            }
        }
        return true;
    }
}

// Test
const blockchain = new Blockchain();

console.log('Mining block 1...');
blockchain.addBlock({ amount: 100, from: 'Alice', to: 'Bob' });

console.log('Mining block 2...');
blockchain.addBlock({ amount: 50, from: 'Bob', to: 'Charlie' });

console.log('\nBlockchain valid?', blockchain.isValid());
console.log('\nBlockchain:', JSON.stringify(blockchain.chain, null, 2));
