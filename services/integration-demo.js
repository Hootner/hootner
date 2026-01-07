import HOOToken from '../.amazonq/agents/hootner-crypto-ecosystem/hoo-token.js';
import { WalletManager } from '../.amazonq/agents/hootner-crypto-ecosystem/hoo-wallet.js';
import MarketplaceService from './marketplace-service.js';
import PaymentService from './payment-service.js';
import RewardsProgram from './rewards-service.js';
import StakingService from './staking-service.js';

console.log('🦉 ========================================');
console.log('🦉  HOOTNER INTEGRATED ECOSYSTEM');
console.log('🦉  Complete Crypto + Services Demo');
console.log('🦉 ========================================\n');

// Initialize core
const hoo = new HOOToken();
const walletManager = new WalletManager(hoo);
const marketplace = new MarketplaceService(hoo);
const payments = new PaymentService(hoo);
const rewards = new RewardsProgram(hoo);
const staking = new StakingService(hoo);

// Setup wallets
const alice = walletManager.createWallet('Alice');
const bob = walletManager.createWallet('Bob');

// Distribute tokens
hoo.transfer('genesis', alice.address, 100000 * (10 ** hoo.decimals));
hoo.transfer('genesis', bob.address, 50000 * (10 ** hoo.decimals));
hoo.transfer('genesis', 'rewards-pool', 500000 * (10 ** hoo.decimals));
hoo.transfer('genesis', 'staking-pool', 300000 * (10 ** hoo.decimals));

console.log('\n--- MARKETPLACE ---');
marketplace.addProduct('vid1', 'Premium Video Course', 49.99, 500);
marketplace.addProduct('vid2', 'Exclusive Documentary', 29.99, 300);
marketplace.addProduct('sub1', 'Monthly Subscription', 9.99, 100);

marketplace.listProducts();

console.log('\n--- PURCHASE WITH HOO ---');
const order = marketplace.purchaseWithHOO('vid1', alice.address);

console.log('\n--- REWARDS PROGRAM ---');
rewards.enrollMember(alice.address, 'silver');
rewards.enrollMember(bob.address, 'bronze');

const reward = rewards.earnRewards(alice.address, 500 * (10 ** hoo.decimals));
console.log(`Alice earned rewards from purchase`);

const aliceStatus = rewards.getMemberStatus(alice.address);
console.log(`Alice status: ${aliceStatus.tier} tier, ${aliceStatus.points} points`);

console.log('\n--- STAKING FOR PREMIUM ---');
const stake1 = staking.stake(alice.address, 5000 * (10 ** hoo.decimals), 90);
const stake2 = staking.stake(bob.address, 1000 * (10 ** hoo.decimals), 30);

const aliceSummary = staking.getStakingSummary(alice.address);
console.log(`\nAlice Premium Tier: ${aliceSummary.premiumTier}`);
console.log(`Features unlocked:`);
aliceSummary.features.forEach(f => console.log(`  ✓ ${f}`));

const bobSummary = staking.getStakingSummary(bob.address);
console.log(`\nBob Premium Tier: ${bobSummary.premiumTier}`);
console.log(`Features unlocked:`);
bobSummary.features.forEach(f => console.log(`  ✓ ${f}`));

console.log('\n--- PAYMENT SUMMARY ---');
const paymentSummary = payments.getSummary();
console.log(`Total payments: ${paymentSummary.totalPayments}`);
console.log(`HOO payments: ${paymentSummary.hooPayments}`);
console.log(`Total HOO processed: ${paymentSummary.totalHOO}`);

console.log('\n--- FINAL BALANCES ---');
walletManager.listWallets();

console.log('\n🦉 ========================================');
console.log('🦉  INTEGRATION COMPLETE');
console.log('🦉 ========================================');
console.log('✓ Marketplace with HOO payments');
console.log('✓ Rewards program with tier bonuses');
console.log('✓ Staking for premium features');
console.log('✓ Unified payment processing');
console.log('\n🦉 The Owl Never Sleeps! 🌙\n');
