import HOOToken from '../.amazonq/agents/hootner-crypto-ecosystem/hoo-token.js';

class RewardsProgram {
    constructor(hooToken) {
        this.hooToken = hooToken;
        this.members = new Map();
        this.rewardPool = 'rewards-pool';
        this.rewardRate = 0.05; // 5% cashback in HOO
    }
    
    enrollMember(address, tier = 'bronze') {
        const member = {
            address,
            tier, // bronze, silver, gold, platinum
            points: 0,
            totalEarned: 0,
            joinDate: Date.now(),
            transactions: []
        };
        
        this.members.set(address, member);
        console.log(`✓ ${address} enrolled in HOO Rewards (${tier} tier)`);
        return member;
    }
    
    getTierMultiplier(tier) {
        const multipliers = {
            bronze: 1,
            silver: 1.5,
            gold: 2,
            platinum: 3
        };
        return multipliers[tier] || 1;
    }
    
    earnRewards(address, purchaseAmount) {
        const member = this.members.get(address);
        if (!member) {
            throw new Error('Not enrolled in rewards program');
        }
        
        const multiplier = this.getTierMultiplier(member.tier);
        const baseReward = Math.floor(purchaseAmount * this.rewardRate);
        const reward = Math.floor(baseReward * multiplier);
        
        // Transfer from rewards pool
        this.hooToken.transfer(this.rewardPool, address, reward);
        
        member.points += reward;
        member.totalEarned += reward;
        member.transactions.push({
            type: 'earn',
            amount: reward,
            purchaseAmount,
            timestamp: Date.now()
        });
        
        console.log(`✓ Earned ${reward / (10 ** this.hooToken.decimals)} HOO (${member.tier} ${multiplier}x)`);
        return reward;
    }
    
    redeemPoints(address, points) {
        const member = this.members.get(address);
        if (!member) {
            throw new Error('Not enrolled in rewards program');
        }
        
        if (member.points < points) {
            throw new Error('Insufficient points');
        }
        
        member.points -= points;
        member.transactions.push({
            type: 'redeem',
            amount: points,
            timestamp: Date.now()
        });
        
        console.log(`✓ Redeemed ${points / (10 ** this.hooToken.decimals)} HOO points`);
        return points;
    }
    
    upgradeTier(address) {
        const member = this.members.get(address);
        if (!member) {
            throw new Error('Not enrolled in rewards program');
        }
        
        const tiers = ['bronze', 'silver', 'gold', 'platinum'];
        const currentIndex = tiers.indexOf(member.tier);
        
        if (currentIndex < tiers.length - 1) {
            member.tier = tiers[currentIndex + 1];
            console.log(`✓ Upgraded to ${member.tier} tier!`);
        } else {
            console.log('Already at maximum tier');
        }
        
        return member.tier;
    }
    
    getMemberStatus(address) {
        const member = this.members.get(address);
        if (!member) return null;
        
        return {
            tier: member.tier,
            points: member.points / (10 ** this.hooToken.decimals),
            totalEarned: member.totalEarned / (10 ** this.hooToken.decimals),
            multiplier: this.getTierMultiplier(member.tier)
        };
    }
}

export default RewardsProgram;
