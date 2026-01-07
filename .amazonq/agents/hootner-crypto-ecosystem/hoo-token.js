import crypto from 'crypto';

class HOOToken {
    constructor() {
        this.name = 'HOOTNER';
        this.symbol = 'HOO';
        this.decimals = 8;
        this.totalSupply = 1000000 * (10 ** this.decimals); // 1 million HOO
        this.balances = new Map();
        this.allowances = new Map();
        
        // Genesis allocation
        this.balances.set('genesis', this.totalSupply);
    }
    
    balanceOf(address) {
        return this.balances.get(address) || 0;
    }
    
    transfer(from, to, amount) {
        const fromBalance = this.balanceOf(from);
        
        if (fromBalance < amount) {
            throw new Error('Insufficient balance');
        }
        
        this.balances.set(from, fromBalance - amount);
        this.balances.set(to, this.balanceOf(to) + amount);
        
        console.log(`✓ Transferred ${amount / (10 ** this.decimals)} HOO from ${from} to ${to}`);
        return true;
    }
    
    approve(owner, spender, amount) {
        const key = `${owner}:${spender}`;
        this.allowances.set(key, amount);
        console.log(`✓ ${owner} approved ${spender} to spend ${amount / (10 ** this.decimals)} HOO`);
        return true;
    }
    
    transferFrom(spender, from, to, amount) {
        const key = `${from}:${spender}`;
        const allowance = this.allowances.get(key) || 0;
        
        if (allowance < amount) {
            throw new Error('Allowance exceeded');
        }
        
        this.transfer(from, to, amount);
        this.allowances.set(key, allowance - amount);
        return true;
    }
    
    mint(to, amount) {
        this.totalSupply += amount;
        this.balances.set(to, this.balanceOf(to) + amount);
        console.log(`✓ Minted ${amount / (10 ** this.decimals)} HOO to ${to}`);
    }
    
    burn(from, amount) {
        const balance = this.balanceOf(from);
        if (balance < amount) {
            throw new Error('Insufficient balance to burn');
        }
        
        this.balances.set(from, balance - amount);
        this.totalSupply -= amount;
        console.log(`✓ Burned ${amount / (10 ** this.decimals)} HOO from ${from}`);
    }
}

// Test
const hoo = new HOOToken();

console.log('🦉 HOOTNER Token (HOO) Initialized');
console.log(`Total Supply: ${hoo.totalSupply / (10 ** hoo.decimals)} HOO\n`);

// Distribute tokens
hoo.transfer('genesis', 'alice', 10000 * (10 ** hoo.decimals));
hoo.transfer('genesis', 'bob', 5000 * (10 ** hoo.decimals));

console.log(`\nAlice balance: ${hoo.balanceOf('alice') / (10 ** hoo.decimals)} HOO`);
console.log(`Bob balance: ${hoo.balanceOf('bob') / (10 ** hoo.decimals)} HOO`);

// Transfer between users
hoo.transfer('alice', 'bob', 1000 * (10 ** hoo.decimals));

console.log(`\nAfter transfer:`);
console.log(`Alice balance: ${hoo.balanceOf('alice') / (10 ** hoo.decimals)} HOO`);
console.log(`Bob balance: ${hoo.balanceOf('bob') / (10 ** hoo.decimals)} HOO`);

export default HOOToken;
