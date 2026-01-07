// Minimal CQRS - Command/Query Separation, Event Bus
class CommandBus {
  constructor() {
    this.handlers = new Map();
  }

  register(commandType, handler) {
    this.handlers.set(commandType, handler);
  }

  async execute(command) {
    const handler = this.handlers.get(command.type);
    if (!handler) throw new Error(`No handler for ${command.type}`);
    
    console.log(`Executing command: ${command.type}`);
    return await handler(command);
  }
}

class QueryBus {
  constructor() {
    this.handlers = new Map();
  }

  register(queryType, handler) {
    this.handlers.set(queryType, handler);
  }

  async execute(query) {
    const handler = this.handlers.get(query.type);
    if (!handler) throw new Error(`No handler for ${query.type}`);
    
    console.log(`Executing query: ${query.type}`);
    return await handler(query);
  }
}

class EventBus {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(handler);
  }

  publish(event) {
    console.log(`Publishing event: ${event.type}`);
    const handlers = this.subscribers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }
}

// Write Model (Commands)
class WriteModel {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.data = new Map();
  }

  createUser(userId, name, email) {
    this.data.set(userId, { id: userId, name, email, createdAt: Date.now() });
    this.eventBus.publish({ type: 'UserCreated', userId, name, email });
  }

  updateUser(userId, updates) {
    const user = this.data.get(userId);
    if (!user) throw new Error('User not found');
    
    Object.assign(user, updates);
    this.eventBus.publish({ type: 'UserUpdated', userId, updates });
  }
}

// Read Model (Queries)
class ReadModel {
  constructor() {
    this.users = new Map();
    this.usersByEmail = new Map();
  }

  // Event handlers to update read model
  onUserCreated(event) {
    const user = { id: event.userId, name: event.name, email: event.email };
    this.users.set(event.userId, user);
    this.usersByEmail.set(event.email, user);
  }

  onUserUpdated(event) {
    const user = this.users.get(event.userId);
    if (user) Object.assign(user, event.updates);
  }

  // Queries
  getUserById(userId) {
    return this.users.get(userId);
  }

  getUserByEmail(email) {
    return this.usersByEmail.get(email);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }
}

// Demo
console.log('=== CQRS Demo ===\n');

const eventBus = new EventBus();
const commandBus = new CommandBus();
const queryBus = new QueryBus();

const writeModel = new WriteModel(eventBus);
const readModel = new ReadModel();

// Subscribe read model to events
eventBus.subscribe('UserCreated', (e) => readModel.onUserCreated(e));
eventBus.subscribe('UserUpdated', (e) => readModel.onUserUpdated(e));

// Register command handlers
commandBus.register('CreateUser', (cmd) => {
  writeModel.createUser(cmd.userId, cmd.name, cmd.email);
  return { success: true };
});

commandBus.register('UpdateUser', (cmd) => {
  writeModel.updateUser(cmd.userId, cmd.updates);
  return { success: true };
});

// Register query handlers
queryBus.register('GetUserById', (query) => {
  return readModel.getUserById(query.userId);
});

queryBus.register('GetUserByEmail', (query) => {
  return readModel.getUserByEmail(query.email);
});

queryBus.register('GetAllUsers', () => {
  return readModel.getAllUsers();
});

// Execute commands
(async () => {
  console.log('--- Commands ---');
  await commandBus.execute({ type: 'CreateUser', userId: '1', name: 'Alice', email: 'alice@example.com' });
  await commandBus.execute({ type: 'CreateUser', userId: '2', name: 'Bob', email: 'bob@example.com' });
  await commandBus.execute({ type: 'UpdateUser', userId: '1', updates: { name: 'Alice Smith' } });

  console.log('\n--- Queries ---');
  const user1 = await queryBus.execute({ type: 'GetUserById', userId: '1' });
  console.log('User by ID:', user1);

  const user2 = await queryBus.execute({ type: 'GetUserByEmail', email: 'bob@example.com' });
  console.log('User by email:', user2);

  const allUsers = await queryBus.execute({ type: 'GetAllUsers' });
  console.log('All users:', allUsers);
})();

export { CommandBus, QueryBus, EventBus };
