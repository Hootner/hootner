// Money Value Object
export class Money {
  constructor(amount, currency = 'USD') {
    this.amount = amount; // in cents
    this.currency = currency.toUpperCase();
    this.validate();
  }

  validate() {
    if (typeof this.amount !== 'number' || this.amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(this.currency)) {
      throw new Error(`Invalid currency: ${this.currency}`);
    }
  }

  toDollars() {
    return (this.amount / 100).toFixed(2);
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor) {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  equals(other) {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other) {
    if (this.currency !== other.currency) return false;
    return this.amount > other.amount;
  }

  isLessThan(other) {
    if (this.currency !== other.currency) return false;
    return this.amount < other.amount;
  }

  format() {
    const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$' };
    return `${symbols[this.currency] || this.currency}${this.toDollars()}`;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency
    };
  }
}

export default Money;
