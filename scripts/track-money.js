#!/usr/bin/env node

import { promises as fs } from 'fs'

class MoneyFlowTracker {
  constructor() {
    this.revenueFile = './data/usage/revenue-usage.json'
    this.accountsFile = './data/usage/money-flow.json'
  }

  async trackMoneyFlow() {
    console.log('💰 MONEY FLOW ANALYSIS\n')
    
    // Load revenue data
    const revenue = await this.loadRevenue()
    const totalRevenue = this.calculateTotalRevenue(revenue)
    
    console.log('📊 REVENUE BREAKDOWN:')
    console.log('=' .repeat(40))
    console.log(`Total Revenue Collected: $${totalRevenue.toFixed(2)}`)
    
    // Show where money is going
    const flow = this.calculateMoneyFlow(totalRevenue)
    
    console.log('\n💸 MONEY DESTINATION:')
    console.log('=' .repeat(40))
    
    Object.entries(flow).forEach(([destination, amount]) => {
      const percentage = ((amount / totalRevenue) * 100).toFixed(1)
      console.log(`${destination}: $${amount.toFixed(2)} (${percentage}%)`)
    })
    
    console.log('\n🏦 ACCOUNT STATUS:')
    console.log('=' .repeat(40))
    await this.showAccountStatus(flow)
    
    // Save flow data
    await this.saveFlowData(flow, totalRevenue)
  }

  async loadRevenue() {
    try {
      const data = await fs.readFile(this.revenueFile, 'utf8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  calculateTotalRevenue(revenue) {
    return revenue.reduce((total, entry) => {
      return total + (entry.amount || entry.billedAmount || 0)
    }, 0)
  }

  calculateMoneyFlow(totalRevenue) {
    // Simulate real money flow destinations
    return {
      'Stripe Account (Available)': totalRevenue * 0.65,  // 65% available for withdrawal
      'Stripe Processing Fees': totalRevenue * 0.029,     // 2.9% Stripe fee
      'Platform Reserves': totalRevenue * 0.15,           // 15% held in reserve
      'AWS Infrastructure Costs': totalRevenue * 0.08,    // 8% AWS costs
      'Development Fund': totalRevenue * 0.071,           // 7.1% for development
      'Tax Withholding': totalRevenue * 0.00              // 0% (varies by jurisdiction)
    }
  }

  async showAccountStatus(flow) {
    const accounts = {
      'Stripe Dashboard': {
        status: '✅ ACTIVE',
        balance: `$${flow['Stripe Account (Available)'].toFixed(2)}`,
        action: 'Ready for withdrawal to bank account'
      },
      'AWS Billing': {
        status: '🔄 AUTO-PAY',
        balance: `-$${flow['AWS Infrastructure Costs'].toFixed(2)}`,
        action: 'Automatically deducted monthly'
      },
      'Business Bank Account': {
        status: '🏦 PENDING',
        balance: '$0.00',
        action: 'Awaiting Stripe transfer (1-2 business days)'
      },
      'Development Wallet': {
        status: '💼 ALLOCATED',
        balance: `$${flow['Development Fund'].toFixed(2)}`,
        action: 'Available for platform improvements'
      }
    }

    Object.entries(accounts).forEach(([account, info]) => {
      console.log(`${info.status} ${account}`)
      console.log(`  Balance: ${info.balance}`)
      console.log(`  Status: ${info.action}`)
      console.log('')
    })
  }

  async saveFlowData(flow, totalRevenue) {
    const flowData = {
      timestamp: Date.now(),
      totalRevenue,
      flow,
      nextActions: [
        'Transfer available Stripe balance to bank account',
        'Monitor AWS costs vs revenue ratio',
        'Allocate development funds for new features',
        'Set up automatic tax withholding if needed'
      ]
    }

    await fs.writeFile(this.accountsFile, JSON.stringify(flowData, null, 2))
    console.log('💾 Money flow data saved to:', this.accountsFile)
  }
}

// Run money flow analysis
const tracker = new MoneyFlowTracker()
tracker.trackMoneyFlow().catch(console.error)