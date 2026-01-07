import HOOToken from './hoo-token.js';
import { WalletManager } from './hoo-wallet.js';
import { CardSystem } from './hoo-card.js';

console.log('🦉 ========================================');
console.log('🦉  HOOTNER CRYPTO ECOSYSTEM');
console.log('🦉  "The Owl Never Sleeps" - 24/7 Crypto');
console.log('🦉 ========================================\n');

// Initialize token
const hoo = new HOOToken();
console.log(`Total Supply: ${hoo.totalSupply / (10 ** hoo.decimals)} HOO\n`);

// Create wallet manager
const walletManager = new WalletManager(hoo);

// Create wallets
console.log('Creating wallets...');
const aliceWallet = walletManager.createWallet('Alice');
const bobWallet = walletManager.createWallet('Bob');
const merchantWallet = walletManager.createWallet('HOOTNER Marketplace');

// Distribute initial tokens
console.log('\nDistributing tokens from genesis...');
hoo.transfer('genesis', aliceWallet.address, 50000 * (10 ** hoo.decimals));
hoo.transfer('genesis', bobWallet.address, 30000 * (10 ** hoo.decimals));

walletManager.listWallets();

// Wallet transactions
console.log('\n--- Wallet Transactions ---');
aliceWallet.send(bobWallet.address, 5000 * (10 ** hoo.decimals), 'Payment for services');
bobWallet.send(merchantWallet.address, 2000 * (10 ** hoo.decimals), 'Purchase from marketplace');

walletManager.listWallets();

// Create card system
console.log('\n--- HOOTNER Prepaid Cards ---');
const cardSystem = new CardSystem(hoo);

// Issue cards
const aliceCard = cardSystem.issueCard();
const bobCard = cardSystem.issueCard();

// Activate cards
aliceCard.activate('1234');
bobCard.activate('5678');

// Load cards from wallets
console.log('\nLoading cards...');
aliceCard.load(10000 * (10 ** hoo.decimals), aliceWallet.address);
bobCard.load(5000 * (10 ** hoo.decimals), bobWallet.address);

cardSystem.listCards();

// Spend with cards
console.log('\n--- Card Transactions ---');
aliceCard.spend(3000 * (10 ** hoo.decimals), merchantWallet.address, '1234');
bobCard.spend(1000 * (10 ** hoo.decimals), merchantWallet.address, '5678');

cardSystem.listCards();
walletManager.listWallets();

// Summary
console.log('\n🦉 ========================================');
console.log('🦉  ECOSYSTEM SUMMARY');
console.log('🦉 ========================================');
console.log(`Total HOO in circulation: ${hoo.totalSupply / (10 ** hoo.decimals)}`);
console.log(`Active wallets: ${walletManager.wallets.size}`);
console.log(`Active cards: ${cardSystem.cards.size}`);
console.log('\n✓ HOOTNER Crypto Ecosystem operational!');
console.log('🦉 The Owl Never Sleeps! 🌙\n');
