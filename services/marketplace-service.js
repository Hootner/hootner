import HOOToken from '../.amazonq/agents/hootner-crypto-ecosystem/hoo-token.js';

class MarketplaceService {
    constructor(hooToken) {
        this.hooToken = hooToken;
        this.products = new Map();
        this.orders = new Map();
        this.orderCounter = 1;
    }
    
    addProduct(id, name, price, priceInHOO) {
        this.products.set(id, {
            id,
            name,
            price, // USD
            priceInHOO: priceInHOO * (10 ** this.hooToken.decimals),
            available: true
        });
        console.log(`✓ Added product: ${name} - $${price} or ${priceInHOO} HOO`);
    }
    
    getProduct(id) {
        return this.products.get(id);
    }
    
    listProducts() {
        console.log('\n🛒 HOOTNER Marketplace Products:');
        for (let [id, product] of this.products) {
            const hooPrice = product.priceInHOO / (10 ** this.hooToken.decimals);
            console.log(`  [${id}] ${product.name} - $${product.price} or ${hooPrice} HOO`);
        }
    }
    
    purchaseWithHOO(productId, buyerAddress) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        
        if (!product.available) {
            throw new Error('Product not available');
        }
        
        // Transfer HOO to marketplace
        this.hooToken.transfer(buyerAddress, 'marketplace', product.priceInHOO);
        
        const order = {
            id: this.orderCounter++,
            productId,
            buyer: buyerAddress,
            amount: product.priceInHOO,
            paymentMethod: 'HOO',
            timestamp: Date.now(),
            status: 'completed'
        };
        
        this.orders.set(order.id, order);
        
        console.log(`✓ Order #${order.id}: ${product.name} purchased with HOO`);
        return order;
    }
    
    getOrders(address) {
        return Array.from(this.orders.values())
            .filter(order => order.buyer === address);
    }
}

export default MarketplaceService;
