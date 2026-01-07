import crypto from 'crypto';

class HOOCard {
    constructor(cardNumber, token) {
        this.cardNumber = cardNumber;
        this.token = token;
        this.balance = 0;
        this.pin = null;
        this.active = false;
        this.transactions = [];
    }
    
    activate(pin) {
        this.pin = crypto.createHash('sha256').update(pin).digest('hex');
        this.active = true;
        console.log(`✓ Card ${this.cardNumber} activated`);
    }
    
    verifyPin(pin) {
        const hashedPin = crypto.createHash('sha256').update(pin).digest('hex');
        return this.pin === hashedPin;
    }
    
    load(amount, fromAddress) {
        if (!this.active) {
            throw new Error('Card not activated');
        }
        
        this.token.transfer(fromAddress, `card:${this.cardNumber}`, amount);
        this.balance += amount;
        
        this.transactions.push({
            type: 'load',
            amount,
            timestamp: Date.now()
        });
        
        console.log(`✓ Loaded ${amount / (10 ** this.token.decimals)} HOO to card ${this.cardNumber}`);
    }
    
    spend(amount, merchant, pin) {
        if (!this.active) {
            throw new Error('Card not activated');
        }
        
        if (!this.verifyPin(pin)) {
            throw new Error('Invalid PIN');
        }
        
        if (this.balance < amount) {
            throw new Error('Insufficient card balance');
        }
        
        this.balance -= amount;
        this.token.transfer(`card:${this.cardNumber}`, merchant, amount);
        
        this.transactions.push({
            type: 'spend',
            amount,
            merchant,
            timestamp: Date.now()
        });
        
        console.log(`✓ Spent ${amount / (10 ** this.token.decimals)} HOO at ${merchant}`);
    }
    
    getBalance() {
        return this.balance;
    }
    
    getTransactions() {
        return this.transactions;
    }
}

class CardSystem {
    constructor(token) {
        this.token = token;
        this.cards = new Map();
        this.cardCounter = 1000;
    }
    
    issueCard() {
        const cardNumber = `HOO-${this.cardCounter++}`;
        const card = new HOOCard(cardNumber, this.token);
        this.cards.set(cardNumber, card);
        
        console.log(`✓ Issued HOOTNER Card: ${cardNumber}`);
        return card;
    }
    
    getCard(cardNumber) {
        return this.cards.get(cardNumber);
    }
    
    listCards() {
        console.log('\n💳 HOOTNER Prepaid Cards:');
        for (let [number, card] of this.cards) {
            const balance = card.getBalance() / (10 ** this.token.decimals);
            const status = card.active ? 'Active' : 'Inactive';
            console.log(`  ${number}: ${balance} HOO (${status})`);
        }
    }
}

export { HOOCard, CardSystem };
