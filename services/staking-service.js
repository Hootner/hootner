import HOOToken from '../.amazonq/agents/hootner-crypto-ecosystem/hoo-token.js';

class StakingService {
    constructor(hooToken) {
        this.hooToken = hooToken;
        this.stakes = new Map();
        this.stakingPool = 'staking-pool';
        this.apr = 0.12; // 12% annual percentage rate
    }
    
    stake(address, amount, duration = 30) {
        const stake = {
            id: `STAKE-${Date.now()}`,
            address,
            amount,
            duration, // days
            startTime: Date.now(),
            endTime: Date.now() + (duration * 24 * 60 * 60 * 1000),
            rewards: 0,
            status: 'active'
        };
        
        // Transfer to staking pool
        this.hooToken.transfer(address, this.stakingPool, amount);
        
        this.stakes.set(stake.id, stake);
        
        console.log(`✓ Staked ${amount / (10 ** this.hooToken.decimals)} HOO for ${duration} days`);
        console.log(`  Stake ID: ${stake.id}`);
        
        return stake;
    }
    
    calculateRewards(stake) {
        const now = Date.now();
        const elapsed = Math.min(now - stake.startTime, stake.endTime - stake.startTime);
        const daysElapsed = elapsed / (24 * 60 * 60 * 1000);
        
        const rewards = Math.floor(stake.amount * this.apr * (daysElapsed / 365));
        return rewards;
    }
    
    checkRewards(stakeId) {
        const stake = this.stakes.get(stakeId);
        if (!stake) {
            throw new Error('Stake not found');
        }
        
        const rewards = this.calculateRewards(stake);
        return rewards / (10 ** this.hooToken.decimals);
    }
    
    unstake(stakeId) {
        const stake = this.stakes.get(stakeId);
        if (!stake) {
            throw new Error('Stake not found');
        }
        
        if (stake.status !== 'active') {
            throw new Error('Stake already completed');
        }
        
        const now = Date.now();
        const rewards = this.calculateRewards(stake);
        
        // Early withdrawal penalty
        let penalty = 0;
        if (now < stake.endTime) {
            penalty = Math.floor(rewards * 0.5); // 50% penalty
            console.log(`⚠️  Early withdrawal: 50% penalty applied`);
        }
        
        const finalRewards = rewards - penalty;
        
        // Return staked amount + rewards
        this.hooToken.transfer(this.stakingPool, stake.address, stake.amount + finalRewards);
        
        stake.status = 'completed';
        stake.rewards = finalRewards;
        
        console.log(`✓ Unstaked ${stake.amount / (10 ** this.hooToken.decimals)} HOO`);
        console.log(`  Rewards: ${finalRewards / (10 ** this.hooToken.decimals)} HOO`);
        
        return stake;
    }
    
    getPremiumAccess(address) {
        const userStakes = Array.from(this.stakes.values())
            .filter(s => s.address === address && s.status === 'active');
        
        const totalStaked = userStakes.reduce((sum, s) => sum + s.amount, 0);
        const hooAmount = totalStaked / (10 ** this.hooToken.decimals);
        
        // Premium tiers based on staked amount
        if (hooAmount >= 10000) return 'platinum';
        if (hooAmount >= 5000) return 'gold';
        if (hooAmount >= 1000) return 'silver';
        if (hooAmount >= 100) return 'bronze';
        return 'free';
    }
    
    getPremiumFeatures(tier) {
        const features = {
            free: ['Basic video player', 'Standard quality'],
            bronze: ['HD quality', 'Ad-free viewing', '5 downloads/month'],
            silver: ['4K quality', 'Offline mode', '20 downloads/month', 'Early access'],
            gold: ['8K quality', 'Unlimited downloads', 'Priority support', 'Exclusive content'],
            platinum: ['All features', 'Custom themes', 'API access', 'Revenue sharing']
        };
        
        return features[tier] || features.free;
    }
    
    getStakingSummary(address) {
        const userStakes = Array.from(this.stakes.values())
            .filter(s => s.address === address);
        
        const active = userStakes.filter(s => s.status === 'active');
        const totalStaked = active.reduce((sum, s) => sum + s.amount, 0);
        const totalRewards = active.reduce((sum, s) => sum + this.calculateRewards(s), 0);
        
        const tier = this.getPremiumAccess(address);
        const features = this.getPremiumFeatures(tier);
        
        return {
            activeStakes: active.length,
            totalStaked: totalStaked / (10 ** this.hooToken.decimals),
            pendingRewards: totalRewards / (10 ** this.hooToken.decimals),
            premiumTier: tier,
            features
        };
    }
}

export default StakingService;
