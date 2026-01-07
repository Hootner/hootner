import crypto from 'crypto';

class HOOWallet {
    constructor(token) {
        this.token = token;
        this.privateKey = crypto.randomBytes(32).toString('hex');
        this.publicKey = crypto.createHash('sha256').update(this.privateKey).digest('hex');
        this.address = this.publicKey.substring(0, 40);
        this.transactions = [];
    }
    
    getBalance() {
        return this.token.balanceOf(this.address);
    }
    
    send(toAddress, amount, memo = '') {
        try {
            this.token.transfer(this.address, toAddress, amount);
            
            const tx = {
                id: crypto.randomBytes(16).toString('hex'),
                from: this.address,
                to: toAddress,
                amount,
                memo,
                timestamp: Date.now()
            };
            
            this.transactions.push(tx);
            return tx;
        } catch (error) {
            console.error(`✗ Transaction failed: ${error.message}`);
            return null;
        }
    }
    
    receive(fromAddress, amount) {
        const tx = {
            id: crypto.randomBytes(16).toString('hex'),
            from: fromAddress,
            to: this.address,
            amount,
            timestamp: Date.now()
        };
        
        this.transactions.push(tx);
        return tx;
    }
    
    getTransactionHistory() {
        return this.transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    exportPrivateKey() {
        console.warn('⚠️  Keep your private key secure!');
        return this.privateKey;
    }
    
    getInfo() {
        return {
            address: this.address,
            balance: this.getBalance(),
            transactions: this.transactions.length
        };
    }
}

class WalletManager {
    constructor(token) {
        this.token = token;
        this.wallets = new Map();
    }
    
    createWallet(name) {
        const wallet = new HOOWallet(this.token);
        this.wallets.set(name, wallet);
        console.log(`✓ Created wallet for ${name}`);
        console.log(`  Address: ${wallet.address}`);
        return wallet;
    }
    
    getWallet(name) {
        return this.wallets.get(name);
    }
    
    listWallets() {
        console.log('\n🦉 HOOTNER Wallets:');
        for (let [name, wallet] of this.wallets) {
            const info = wallet.getInfo();
            console.log(`  ${name}: ${info.balance / (10 ** this.token.decimals)} HOO (${info.transactions} txs)`);
        }
    }
}

export { HOOWallet, WalletManager };
