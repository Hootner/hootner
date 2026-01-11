/**
 * Accounting Software Integration Service - QuickBooks/NetSuite Financial Reporting
 * Manages financial data integration and automated reporting
 */

class AccountingSoftwareIntegrationService {
    constructor() {
        this.connections = new Map();
        this.accounts = new Map();
        this.transactions = new Map();
        this.reports = new Map();
        this.metrics = {
            totalTransactions: 0,
            totalRevenue: 0,
            totalExpenses: 0,
            reconciliationRate: 0
        };
    }

    // QuickBooks Integration
    async connectQuickBooks(config) {
        const connection = {
            type: 'QuickBooks',
            companyId: config.companyId,
            accessToken: config.accessToken,
            refreshToken: config.refreshToken,
            baseUrl: config.sandbox ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com',
            modules: ['Accounting', 'Payroll', 'Payments', 'Reports'],
            status: 'connected'
        };
        
        this.connections.set('quickbooks', connection);
        await this.syncChartOfAccounts('quickbooks');
        return { success: true, modules: connection.modules };
    }

    // NetSuite Integration
    async connectNetSuite(config) {
        const connection = {
            type: 'NetSuite',
            account: config.account,
            consumerKey: config.consumerKey,
            consumerSecret: config.consumerSecret,
            tokenId: config.tokenId,
            tokenSecret: config.tokenSecret,
            modules: ['ERP', 'CRM', 'Ecommerce', 'Analytics'],
            status: 'connected'
        };
        
        this.connections.set('netsuite', connection);
        await this.syncChartOfAccounts('netsuite');
        return { success: true, modules: connection.modules };
    }

    // Chart of Accounts Management
    async syncChartOfAccounts(system) {
        const standardAccounts = [
            { code: '1000', name: 'Cash', type: 'Asset', category: 'Current Assets' },
            { code: '1200', name: 'Accounts Receivable', type: 'Asset', category: 'Current Assets' },
            { code: '1500', name: 'Inventory', type: 'Asset', category: 'Current Assets' },
            { code: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current Liabilities' },
            { code: '3000', name: 'Owner Equity', type: 'Equity', category: 'Equity' },
            { code: '4000', name: 'Revenue', type: 'Income', category: 'Revenue' },
            { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'COGS' },
            { code: '6000', name: 'Operating Expenses', type: 'Expense', category: 'Operating' }
        ];
        
        standardAccounts.forEach(account => {
            this.accounts.set(account.code, {
                ...account,
                system,
                balance: 0,
                lastUpdated: new Date()
            });
        });
        
        return { synced: standardAccounts.length, system };
    }

    // Transaction Management
    async createTransaction(transactionData) {
        const transaction = {
            id: `TXN-${Date.now()}`,
            type: transactionData.type, // invoice, payment, expense, journal
            date: transactionData.date || new Date(),
            amount: transactionData.amount,
            description: transactionData.description,
            accounts: transactionData.accounts, // [{account: '1000', debit: 100}, {account: '4000', credit: 100}]
            reference: transactionData.reference,
            status: 'pending',
            createdAt: new Date()
        };
        
        // Validate double-entry bookkeeping
        const totalDebits = transaction.accounts
            .filter(entry => entry.debit)
            .reduce((sum, entry) => sum + entry.debit, 0);
        
        const totalCredits = transaction.accounts
            .filter(entry => entry.credit)
            .reduce((sum, entry) => sum + entry.credit, 0);
        
        if (Math.abs(totalDebits - totalCredits) > 0.01) {
            throw new Error('Transaction does not balance: debits must equal credits');
        }
        
        this.transactions.set(transaction.id, transaction);
        this.metrics.totalTransactions++;
        
        // Update account balances
        await this.updateAccountBalances(transaction);
        
        return transaction;
    }

    async updateAccountBalances(transaction) {
        transaction.accounts.forEach(entry => {
            const account = this.accounts.get(entry.account);
            if (account) {
                if (entry.debit) {
                    account.balance += entry.debit;
                }
                if (entry.credit) {
                    account.balance -= entry.credit;
                }
                account.lastUpdated = new Date();
            }
        });
    }

    // Automated Reconciliation
    async performReconciliation(accountCode, statementData) {
        const account = this.accounts.get(accountCode);
        if (!account) throw new Error('Account not found');
        
        const reconciliation = {
            id: `REC-${Date.now()}`,
            accountCode,
            statementDate: statementData.date,
            statementBalance: statementData.balance,
            bookBalance: account.balance,
            difference: statementData.balance - account.balance,
            status: 'in_progress',
            matchedTransactions: [],
            unmatchedTransactions: [],
            createdAt: new Date()
        };
        
        // Auto-match transactions
        const accountTransactions = Array.from(this.transactions.values())
            .filter(txn => txn.accounts.some(entry => entry.account === accountCode))
            .filter(txn => new Date(txn.date) <= new Date(statementData.date));
        
        statementData.transactions.forEach(stmtTxn => {
            const match = accountTransactions.find(bookTxn => 
                Math.abs(bookTxn.amount - stmtTxn.amount) < 0.01 &&
                Math.abs(new Date(bookTxn.date) - new Date(stmtTxn.date)) < 3 * 24 * 60 * 60 * 1000 // 3 days
            );
            
            if (match) {
                reconciliation.matchedTransactions.push({
                    statementTransaction: stmtTxn,
                    bookTransaction: match
                });
            } else {
                reconciliation.unmatchedTransactions.push(stmtTxn);
            }
        });
        
        // Calculate reconciliation rate
        const totalStatementTransactions = statementData.transactions.length;
        const matchedCount = reconciliation.matchedTransactions.length;
        reconciliation.matchRate = totalStatementTransactions > 0 
            ? (matchedCount / totalStatementTransactions * 100).toFixed(2) + '%'
            : '0%';
        
        if (reconciliation.unmatchedTransactions.length === 0 && Math.abs(reconciliation.difference) < 0.01) {
            reconciliation.status = 'completed';
        }
        
        return reconciliation;
    }

    // Financial Reporting
    async generateFinancialReport(reportType, period) {
        const reports = {
            'balance_sheet': this.generateBalanceSheet.bind(this),
            'income_statement': this.generateIncomeStatement.bind(this),
            'cash_flow': this.generateCashFlowStatement.bind(this),
            'trial_balance': this.generateTrialBalance.bind(this)
        };
        
        const reportGenerator = reports[reportType];
        if (!reportGenerator) throw new Error('Unknown report type');
        
        const report = await reportGenerator(period);
        report.id = `RPT-${Date.now()}`;
        report.type = reportType;
        report.period = period;
        report.generatedAt = new Date();
        
        this.reports.set(report.id, report);
        return report;
    }

    async generateBalanceSheet(period) {
        const assets = this.getAccountsByType('Asset');
        const liabilities = this.getAccountsByType('Liability');
        const equity = this.getAccountsByType('Equity');
        
        return {
            assets: {
                current: assets.filter(acc => acc.category.includes('Current')),
                fixed: assets.filter(acc => acc.category.includes('Fixed')),
                total: assets.reduce((sum, acc) => sum + acc.balance, 0)
            },
            liabilities: {
                current: liabilities.filter(acc => acc.category.includes('Current')),
                longTerm: liabilities.filter(acc => acc.category.includes('Long')),
                total: liabilities.reduce((sum, acc) => sum + acc.balance, 0)
            },
            equity: {
                accounts: equity,
                total: equity.reduce((sum, acc) => sum + acc.balance, 0)
            }
        };
    }

    async generateIncomeStatement(period) {
        const revenue = this.getAccountsByType('Income');
        const expenses = this.getAccountsByType('Expense');
        const cogs = expenses.filter(acc => acc.category === 'COGS');
        const operating = expenses.filter(acc => acc.category === 'Operating');
        
        const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
        const totalCOGS = cogs.reduce((sum, acc) => sum + acc.balance, 0);
        const totalOperating = operating.reduce((sum, acc) => sum + acc.balance, 0);
        
        return {
            revenue: {
                accounts: revenue,
                total: totalRevenue
            },
            costOfGoodsSold: {
                accounts: cogs,
                total: totalCOGS
            },
            grossProfit: totalRevenue - totalCOGS,
            operatingExpenses: {
                accounts: operating,
                total: totalOperating
            },
            netIncome: totalRevenue - totalCOGS - totalOperating
        };
    }

    async generateCashFlowStatement(period) {
        // Simplified cash flow calculation
        const cashAccount = this.accounts.get('1000');
        const beginningCash = 0; // Would be from previous period
        const endingCash = cashAccount ? cashAccount.balance : 0;
        
        return {
            operatingActivities: {
                netIncome: await this.calculateNetIncome(period),
                adjustments: [],
                total: endingCash * 0.7 // Simplified
            },
            investingActivities: {
                capitalExpenditures: 0,
                total: endingCash * 0.2 // Simplified
            },
            financingActivities: {
                borrowings: 0,
                total: endingCash * 0.1 // Simplified
            },
            beginningCash,
            endingCash,
            netChange: endingCash - beginningCash
        };
    }

    async generateTrialBalance(period) {
        const accounts = Array.from(this.accounts.values());
        let totalDebits = 0;
        let totalCredits = 0;
        
        const trialBalance = accounts.map(account => {
            const balance = account.balance;
            const isDebitBalance = ['Asset', 'Expense'].includes(account.type);
            
            if (isDebitBalance && balance > 0) {
                totalDebits += balance;
                return { ...account, debit: balance, credit: 0 };
            } else if (!isDebitBalance && balance > 0) {
                totalCredits += balance;
                return { ...account, debit: 0, credit: balance };
            } else {
                return { ...account, debit: 0, credit: 0 };
            }
        });
        
        return {
            accounts: trialBalance,
            totals: {
                debits: totalDebits,
                credits: totalCredits,
                balanced: Math.abs(totalDebits - totalCredits) < 0.01
            }
        };
    }

    getAccountsByType(type) {
        return Array.from(this.accounts.values()).filter(account => account.type === type);
    }

    async calculateNetIncome(period) {
        const incomeStatement = await this.generateIncomeStatement(period);
        return incomeStatement.netIncome;
    }

    // Compliance & Audit
    async generateAuditTrail(accountCode, startDate, endDate) {
        const transactions = Array.from(this.transactions.values())
            .filter(txn => {
                const txnDate = new Date(txn.date);
                return txnDate >= new Date(startDate) && 
                       txnDate <= new Date(endDate) &&
                       txn.accounts.some(entry => entry.account === accountCode);
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return {
            accountCode,
            period: { startDate, endDate },
            transactions,
            summary: {
                totalTransactions: transactions.length,
                totalDebits: transactions.reduce((sum, txn) => {
                    const debitEntry = txn.accounts.find(entry => entry.account === accountCode && entry.debit);
                    return sum + (debitEntry ? debitEntry.debit : 0);
                }, 0),
                totalCredits: transactions.reduce((sum, txn) => {
                    const creditEntry = txn.accounts.find(entry => entry.account === accountCode && entry.credit);
                    return sum + (creditEntry ? creditEntry.credit : 0);
                }, 0)
            }
        };
    }

    getMetrics() {
        const accounts = Array.from(this.accounts.values());
        const revenue = accounts.filter(acc => acc.type === 'Income').reduce((sum, acc) => sum + acc.balance, 0);
        const expenses = accounts.filter(acc => acc.type === 'Expense').reduce((sum, acc) => sum + acc.balance, 0);
        
        return {
            ...this.metrics,
            totalRevenue: revenue,
            totalExpenses: expenses,
            netIncome: revenue - expenses,
            totalAccounts: this.accounts.size,
            connectedSystems: this.connections.size,
            reportsGenerated: this.reports.size
        };
    }
}

module.exports = AccountingSoftwareIntegrationService;