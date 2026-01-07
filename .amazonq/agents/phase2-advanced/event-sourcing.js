// Minimal Event Sourcing - Event Store, Projections, Snapshots
class EventStore {
  constructor() {
    this.events = [];
    this.snapshots = new Map();
    this.projections = new Map();
  }

  // Append event
  append(aggregateId, eventType, data) {
    const event = {
      id: this.events.length + 1,
      aggregateId,
      eventType,
      data,
      timestamp: Date.now(),
      version: this.getVersion(aggregateId) + 1
    };

    this.events.push(event);
    console.log(`Event stored: ${eventType} for ${aggregateId}`);

    // Update projections
    this.updateProjections(event);

    return event;
  }

  // Get events for aggregate
  getEvents(aggregateId, fromVersion = 0) {
    return this.events.filter(e => 
      e.aggregateId === aggregateId && e.version > fromVersion
    );
  }

  // Get current version
  getVersion(aggregateId) {
    const events = this.events.filter(e => e.aggregateId === aggregateId);
    return events.length > 0 ? events[events.length - 1].version : 0;
  }

  // Rebuild state from events
  rebuild(aggregateId) {
    const snapshot = this.snapshots.get(aggregateId);
    const fromVersion = snapshot ? snapshot.version : 0;
    const events = this.getEvents(aggregateId, fromVersion);

    let state = snapshot ? snapshot.state : {};

    events.forEach(event => {
      state = this.applyEvent(state, event);
    });

    return state;
  }

  // Apply event to state
  applyEvent(state, event) {
    switch (event.eventType) {
      case 'AccountCreated':
        return { id: event.aggregateId, balance: 0, ...event.data };
      case 'MoneyDeposited':
        return { ...state, balance: state.balance + event.data.amount };
      case 'MoneyWithdrawn':
        return { ...state, balance: state.balance - event.data.amount };
      default:
        return state;
    }
  }

  // Create snapshot
  snapshot(aggregateId) {
    const state = this.rebuild(aggregateId);
    const version = this.getVersion(aggregateId);
    
    this.snapshots.set(aggregateId, { state, version, timestamp: Date.now() });
    console.log(`Snapshot created for ${aggregateId} at version ${version}`);
  }

  // Register projection
  addProjection(name, handler) {
    this.projections.set(name, { handler, state: {} });
  }

  // Update projections
  updateProjections(event) {
    this.projections.forEach((projection, name) => {
      projection.state = projection.handler(projection.state, event);
    });
  }

  // Get projection
  getProjection(name) {
    return this.projections.get(name)?.state;
  }
}

// Demo: Bank Account
console.log('=== Event Sourcing Demo ===\n');

const store = new EventStore();

// Register projection: Account balances
store.addProjection('account-balances', (state, event) => {
  if (event.eventType === 'AccountCreated') {
    state[event.aggregateId] = 0;
  } else if (event.eventType === 'MoneyDeposited') {
    state[event.aggregateId] = (state[event.aggregateId] || 0) + event.data.amount;
  } else if (event.eventType === 'MoneyWithdrawn') {
    state[event.aggregateId] = (state[event.aggregateId] || 0) - event.data.amount;
  }
  return state;
});

// Create account
store.append('account-123', 'AccountCreated', { owner: 'Alice' });

// Transactions
store.append('account-123', 'MoneyDeposited', { amount: 1000 });
store.append('account-123', 'MoneyDeposited', { amount: 500 });
store.append('account-123', 'MoneyWithdrawn', { amount: 200 });

// Create snapshot
store.snapshot('account-123');

// More transactions
store.append('account-123', 'MoneyDeposited', { amount: 300 });

// Rebuild state
console.log('\n--- Rebuild State ---');
const state = store.rebuild('account-123');
console.log('Account state:', state);

// Check projection
console.log('\n--- Projection: Account Balances ---');
console.log(store.getProjection('account-balances'));

// Event history
console.log('\n--- Event History ---');
console.log(store.getEvents('account-123'));

export default EventStore;
