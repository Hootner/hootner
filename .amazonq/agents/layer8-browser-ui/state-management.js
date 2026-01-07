#!/usr/bin/env node
/**
 * Layer 8: State Management - Redux-like state container
 * Dependencies: Layer 8 (Event System)
 */

class StateManager {
  constructor(initialState = {}, reducer) {
    this.state = initialState;
    this.reducer = reducer;
    this.subscribers = [];
    this.middleware = [];
    this.history = [initialState];
    this.historyIndex = 0;
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Dispatch action
  dispatch(action) {
    console.log(`[DISPATCH] ${action.type}`);
    
    // Run middleware
    let next = (a) => {
      const prevState = this.state;
      this.state = this.reducer(this.state, a);
      
      // Save to history
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(this.state);
      this.historyIndex++;
      
      // Notify subscribers
      this.notify(prevState, this.state, a);
      
      return this.state;
    };
    
    for (let i = this.middleware.length - 1; i >= 0; i--) {
      next = this.middleware[i](this)(next);
    }
    
    return next(action);
  }

  // Subscribe to changes
  subscribe(listener) {
    this.subscribers.push(listener);
    console.log(`[SUBSCRIBE] Listener added (${this.subscribers.length} total)`);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(listener);
      if (index > -1) {
        this.subscribers.splice(index, 1);
        console.log(`[UNSUBSCRIBE] Listener removed`);
      }
    };
  }

  // Notify subscribers
  notify(prevState, newState, action) {
    for (const listener of this.subscribers) {
      listener(newState, prevState, action);
    }
  }

  // Add middleware
  use(middleware) {
    this.middleware.push(middleware);
    console.log(`[MIDDLEWARE] Added (${this.middleware.length} total)`);
  }

  // Time travel: Undo
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = this.history[this.historyIndex];
      console.log(`[UNDO] State reverted`);
      this.notify(this.history[this.historyIndex + 1], this.state, { type: 'UNDO' });
    }
  }

  // Time travel: Redo
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = this.history[this.historyIndex];
      console.log(`[REDO] State restored`);
      this.notify(this.history[this.historyIndex - 1], this.state, { type: 'REDO' });
    }
  }

  // Replace reducer
  replaceReducer(newReducer) {
    this.reducer = newReducer;
    console.log(`[REPLACE] Reducer replaced`);
  }
}

// Combine reducers
function combineReducers(reducers) {
  return (state = {}, action) => {
    const newState = {};
    
    for (const [key, reducer] of Object.entries(reducers)) {
      newState[key] = reducer(state[key], action);
    }
    
    return newState;
  };
}

// Logger middleware
function loggerMiddleware(store) {
  return (next) => (action) => {
    console.log(`  [LOG] Action: ${action.type}`);
    const result = next(action);
    console.log(`  [LOG] New state:`, store.getState());
    return result;
  };
}

// Thunk middleware (async actions)
function thunkMiddleware(store) {
  return (next) => (action) => {
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState);
    }
    return next(action);
  };
}

// Create action creator
function createAction(type) {
  return (payload) => ({ type, payload });
}

// Demo
if (require.main === module) {
  console.log('=== State Management Demo ===\n');
  
  // Counter reducer
  const counterReducer = (state = { count: 0 }, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      case 'DECREMENT':
        return { ...state, count: state.count - 1 };
      case 'SET':
        return { ...state, count: action.payload };
      default:
        return state;
    }
  };
  
  // User reducer
  const userReducer = (state = { name: null }, action) => {
    switch (action.type) {
      case 'SET_USER':
        return { ...state, name: action.payload };
      default:
        return state;
    }
  };
  
  // Combine reducers
  const rootReducer = combineReducers({
    counter: counterReducer,
    user: userReducer
  });
  
  // Create store
  const store = new StateManager({}, rootReducer);
  
  // Add middleware
  store.use(loggerMiddleware);
  store.use(thunkMiddleware);
  
  console.log();
  
  // Subscribe
  const unsubscribe = store.subscribe((state, prevState, action) => {
    console.log(`  [SUBSCRIBER] State changed by ${action.type}`);
  });
  
  console.log();
  
  // Dispatch actions
  store.dispatch({ type: 'INCREMENT' });
  console.log();
  
  store.dispatch({ type: 'INCREMENT' });
  console.log();
  
  store.dispatch({ type: 'SET_USER', payload: 'Alice' });
  console.log();
  
  // Async action (thunk)
  const asyncIncrement = (dispatch, getState) => {
    console.log('  [ASYNC] Starting async action');
    setTimeout(() => {
      dispatch({ type: 'INCREMENT' });
    }, 100);
  };
  
  store.dispatch(asyncIncrement);
  
  // Time travel
  setTimeout(() => {
    console.log('\n--- Time Travel ---\n');
    store.undo();
    console.log('State after undo:', store.getState());
    
    console.log();
    store.redo();
    console.log('State after redo:', store.getState());
  }, 200);
}

module.exports = { StateManager, combineReducers, loggerMiddleware, thunkMiddleware, createAction };
