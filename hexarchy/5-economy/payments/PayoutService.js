// Creator Payout Service
import { logger } from '../../0-core/logging/logger.js';

export class PayoutService {
  constructor(payoutRepository, stripeClient) {
    this.payoutRepository = payoutRepository;
    this.stripeClient = stripeClient;

    // Payout settings
    this.minimumPayout = 50.00; // $50 minimum
    this.payoutSchedule = 'monthly'; // monthly, weekly, manual
  }

  // Request payout
  async requestPayout(userId, amount) {
    try {
      // Validate amount
      if (amount < this.minimumPayout) {
        throw new Error(`Minimum payout is $${this.minimumPayout}`);
      }

      // Check available balance
      const balance = await this.getAvailableBalance(userId);
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create payout request
      const payout = await this.payoutRepository.create({
        userId,
        amount,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });

      logger.info('Payout requested', { userId, amount, payoutId: payout.id });
      return payout;
    } catch (error) {
      logger.error('Failed to request payout:', error);
      throw error;
    }
  }

  // Process payout
  async processPayout(payoutId) {
    try {
      const payout = await this.payoutRepository.findById(payoutId);
      if (!payout) {
        throw new Error('Payout not found');
      }

      // Get user Stripe account
      const stripeAccountId = await this.getUserStripeAccount(payout.userId);
      if (!stripeAccountId) {
        throw new Error('Stripe account not connected');
      }

      // Create Stripe transfer
      const transfer = await this.stripeClient.transfers.create({
        amount: Math.round(payout.amount * 100),
        currency: 'usd',
        destination: stripeAccountId,
        metadata: {
          userId: payout.userId,
          payoutId: payout.id
        }
      });

      // Update payout record
      payout.status = 'completed';
      payout.stripeTransferId = transfer.id;
      payout.completedAt = new Date().toISOString();

      await this.payoutRepository.update(payoutId, payout);

      logger.info('Payout processed', { payoutId, amount: payout.amount });
      return payout;
    } catch (error) {
      logger.error('Failed to process payout:', error);

      // Mark as failed
      const payout = await this.payoutRepository.findById(payoutId);
      payout.status = 'failed';
      payout.errorMessage = error.message;
      await this.payoutRepository.update(payoutId, payout);

      throw error;
    }
  }

  // Get available balance
  async getAvailableBalance(userId) {
    // Get all earnings
    const earnings = await this.payoutRepository.findEarningsByUserId(userId);
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    // Get all payouts
    const payouts = await this.payoutRepository.findByUserId(userId);
    const completedPayouts = payouts.filter(p => p.status === 'completed');
    const totalPayouts = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

    // Get pending payouts
    const pendingPayouts = payouts.filter(p => p.status === 'pending');
    const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalPayouts: parseFloat(totalPayouts.toFixed(2)),
      pendingPayouts: parseFloat(totalPending.toFixed(2)),
      availableBalance: parseFloat((totalEarnings - totalPayouts - totalPending).toFixed(2))
    };
  }

  // Get payout history
  async getPayoutHistory(userId, limit = 50) {
    const payouts = await this.payoutRepository.findByUserId(userId, limit);

    return payouts.map(payout => ({
      id: payout.id,
      amount: payout.amount,
      status: payout.status,
      requestedAt: payout.requestedAt,
      completedAt: payout.completedAt,
      errorMessage: payout.errorMessage
    }));
  }

  // Setup Stripe Connect account
  async setupStripeConnect(userId, accountData) {
    try {
      const {
        email,
        country = 'US',
        businessType = 'individual'
      } = accountData;

      // Create Stripe Connect account
      const account = await this.stripeClient.accounts.create({
        type: 'express',
        country,
        email,
        business_type: businessType,
        capabilities: {
          transfers: { requested: true }
        },
        metadata: { userId }
      });

      // Store account ID
      await this.payoutRepository.updateUserStripeAccount(userId, account.id);

      // Create account link for onboarding
      const accountLink = await this.stripeClient.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.APP_URL}/settings/payouts?refresh=true`,
        return_url: `${process.env.APP_URL}/settings/payouts?success=true`,
        type: 'account_onboarding'
      });

      logger.info('Stripe Connect account created', { userId, accountId: account.id });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url
      };
    } catch (error) {
      logger.error('Failed to setup Stripe Connect:', error);
      throw error;
    }
  }

  // Get user Stripe account
  async getUserStripeAccount(userId) {
    const account = await this.payoutRepository.findStripeAccountByUserId(userId);
    return account?.stripeAccountId || null;
  }

  // Process scheduled payouts
  async processScheduledPayouts() {
    try {
      // Get all users with balance >= minimum
      const eligibleUsers = await this.payoutRepository.findEligibleForPayout(this.minimumPayout);

      const results = [];

      for (const user of eligibleUsers) {
        const balance = await this.getAvailableBalance(user.userId);

        if (balance.availableBalance >= this.minimumPayout) {
          const payout = await this.requestPayout(user.userId, balance.availableBalance);
          await this.processPayout(payout.id);
          results.push({ userId: user.userId, amount: balance.availableBalance, status: 'success' });
        }
      }

      logger.info('Scheduled payouts processed', { count: results.length });
      return results;
    } catch (error) {
      logger.error('Failed to process scheduled payouts:', error);
      throw error;
    }
  }

  // Get payout statistics
  async getPayoutStatistics(userId) {
    const payouts = await this.payoutRepository.findByUserId(userId);
    const balance = await this.getAvailableBalance(userId);

    const completed = payouts.filter(p => p.status === 'completed');
    const pending = payouts.filter(p => p.status === 'pending');
    const failed = payouts.filter(p => p.status === 'failed');

    return {
      userId,
      ...balance,
      totalPayouts: payouts.length,
      completedPayouts: completed.length,
      pendingPayouts: pending.length,
      failedPayouts: failed.length,
      lastPayoutDate: completed.length > 0
        ? completed[completed.length - 1].completedAt
        : null,
      nextPayoutEligible: balance.availableBalance >= this.minimumPayout
    };
  }
}

export default PayoutService;
