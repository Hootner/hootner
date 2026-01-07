// Minimal Smart Contract Platform
class SmartContractPlatform {
  constructor() {
    this.contracts = new Map();
    this.state = new Map();
  }

  deploy(address, code) {
    this.contracts.set(address, code);
    this.state.set(address, {});
    console.log(`Deployed contract at ${address}`);
  }

  call(address, method, ...args) {
    const contract = this.contracts.get(address);
    if (!contract) throw new Error('Contract not found');
    
    const state = this.state.get(address);
    const context = { state, emit: (event) => console.log('Event:', event) };
    
    return contract[method].call(context, ...args);
  }

  getState(address) {
    return this.state.get(address);
  }
}

const platform = new SmartContractPlatform();
platform.deploy('0x123', {
  set: function(key, val) { this.state[key] = val; },
  get: function(key) { return this.state[key]; }
});
platform.call('0x123', 'set', 'balance', 100);
console.log(platform.call('0x123', 'get', 'balance'));

export default SmartContractPlatform;
