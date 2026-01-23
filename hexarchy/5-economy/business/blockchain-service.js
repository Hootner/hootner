export class BlockchainService {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
  }

  createBlock(transactions) {
    const block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions,
      hash: this.generateHash(transactions),
      previousHash: this.chain[this.chain.length - 1]?.hash || '0'
    };
    this.chain.push(block);
    return block;
  }

  addTransaction(tx) {
    this.pendingTransactions.push(tx);
    if (this.pendingTransactions.length >= 10) {
      return this.createBlock(this.pendingTransactions.splice(0, 10));
    }
  }

  generateHash(data) {
    return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16);
  }

  getChainLength() {
    return this.chain.length;
  }
}

export default new BlockchainService();
