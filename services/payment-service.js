import HOOToken from '../.amazonq/agents/hootner-crypto-ecosystem/hoo-token.js';

class PaymentService {
    constructor(hooToken) {
        this.hooToken = hooToken;
        this.payments = new Map();
        this.paymentCounter = 1;
    }
    
    processPayment(from, to, amount, method = 'HOO', metadata = {}) {
        const payment = {
            id: `PAY-${this.paymentCounter++}`,
            from,
            to,
            amount,
            method,
            metadata,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        try {
            if (method === 'HOO') {
                this.hooToken.transfer(from, to, amount);
                payment.status = 'completed';
                console.log(`✓ Payment ${payment.id}: ${amount / (10 ** this.hooToken.decimals)} HOO`);
            } else if (method === 'STRIPE') {
                // Simulate Stripe payment
                payment.status = 'completed';
                console.log(`✓ Payment ${payment.id}: $${amount} via Stripe`);
            } else if (method === 'CARD') {
                // HOO Card payment handled separately
                payment.status = 'completed';
                console.log(`✓ Payment ${payment.id}: Card payment`);
            }
            
            this.payments.set(payment.id, payment);
            return payment;
        } catch (error) {
            payment.status = 'failed';
            payment.error = error.message;
            this.payments.set(payment.id, payment);
            throw error;
        }
    }
    
    getPayment(id) {
        return this.payments.get(id);
    }
    
    getPaymentHistory(address) {
        return Array.from(this.payments.values())
            .filter(p => p.from === address || p.to === address)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    
    refund(paymentId) {
        const payment = this.payments.get(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }
        
        if (payment.status !== 'completed') {
            throw new Error('Cannot refund non-completed payment');
        }
        
        if (payment.method === 'HOO') {
            this.hooToken.transfer(payment.to, payment.from, payment.amount);
        }
        
        payment.status = 'refunded';
        console.log(`✓ Refunded payment ${paymentId}`);
        return payment;
    }
    
    getSummary() {
        const completed = Array.from(this.payments.values())
            .filter(p => p.status === 'completed');
        
        const hooPayments = completed.filter(p => p.method === 'HOO');
        const totalHOO = hooPayments.reduce((sum, p) => sum + p.amount, 0);
        
        return {
            totalPayments: completed.length,
            hooPayments: hooPayments.length,
            totalHOO: totalHOO / (10 ** this.hooToken.decimals)
        };
    }
}

export default PaymentService;
