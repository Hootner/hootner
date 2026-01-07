// Minimal Smart Contract VM - Execution, Gas, State
class SmartContractVM {
  constructor() {
    this.state = new Map();
    this.gasPrice = 1;
    this.gasCosts = {
      'LOAD': 3,
      'STORE': 5,
      'ADD': 1,
      'SUB': 1,
      'MUL': 2,
      'DIV': 2,
      'CALL': 10
    };
  }

  execute(contract, method, args, gasLimit = 100) {
    const context = {
      gas: gasLimit,
      sender: 'user-address',
      value: 0,
      state: this.state
    };

    try {
      const result = contract[method](context, ...args);
      const gasUsed = gasLimit - context.gas;
      
      return {
        success: true,
        result,
        gasUsed,
        cost: gasUsed * this.gasPrice
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        gasUsed: gasLimit
      };
    }
  }

  consumeGas(context, operation) {
    const cost = this.gasCosts[operation] || 1;
    
    if (context.gas < cost) {
      throw new Error('Out of gas');
    }
    
    context.gas -= cost;
  }

  load(context, key) {
    this.consumeGas(context, 'LOAD');
    return context.state.get(key) || 0;
  }

  store(context, key, value) {
    this.consumeGas(context, 'STORE');
    context.state.set(key, value);
  }

  add(context, a, b) {
    this.consumeGas(context, 'ADD');
    return a + b;
  }

  sub(context, a, b) {
    this.consumeGas(context, 'SUB');
    return a - b;
  }
}

// Example contracts
const TokenContract = {
  balanceOf(context, vm, address) {
    return vm.load(context, `balance:${address}`);
  },

  transfer(context, vm, to, amount) {
    const from = context.sender;
    const fromBalance = vm.load(context, `balance:${from}`);
    
    if (fromBalance < amount) {
      throw new Error('Insufficient balance');
    }

    const toBalance = vm.load(context, `balance:${to}`);
    
    vm.store(context, `balance:${from}`, vm.sub(context, fromBalance, amount));
    vm.store(context, `balance:${to}`, vm.add(context, toBalance, amount));
    
    return true;
  },

  mint(context, vm, to, amount) {
    const balance = vm.load(context, `balance:${to}`);
    vm.store(context, `balance:${to}`, vm.add(context, balance, amount));
    return true;
  }
};

// Demo
console.log('=== Smart Contract VM Demo ===\n');

const vm = new SmartContractVM();

// Mint tokens
console.log('--- Mint 1000 tokens ---');
const r1 = vm.execute(TokenContract, 'mint', [vm, 'alice', 1000], 100);
console.log('Success:', r1.success);
console.log('Gas used:', r1.gasUsed);
console.log('Cost:', r1.cost);

// Check balance
console.log('\n--- Check balance ---');
const r2 = vm.execute(TokenContract, 'balanceOf', [vm, 'alice'], 50);
console.log('Balance:', r2.result);
console.log('Gas used:', r2.gasUsed);

// Transfer
console.log('\n--- Transfer 300 tokens ---');
const r3 = vm.execute(TokenContract, 'transfer', [vm, 'bob', 300], 100);
console.log('Success:', r3.success);
console.log('Gas used:', r3.gasUsed);

// Check balances
console.log('\n--- Final balances ---');
const r4 = vm.execute(TokenContract, 'balanceOf', [vm, 'alice'], 50);
const r5 = vm.execute(TokenContract, 'balanceOf', [vm, 'bob'], 50);
console.log('Alice:', r4.result);
console.log('Bob:', r5.result);

// Out of gas
console.log('\n--- Out of gas test ---');
const r6 = vm.execute(TokenContract, 'transfer', [vm, 'charlie', 100], 5);
console.log('Success:', r6.success);
console.log('Error:', r6.error);

export default SmartContractVM;
