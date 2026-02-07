// Timeout Utility
export const withTimeout = (promise, timeoutMs, errorMessage = 'Operation timed out') => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

export const createTimeout = (fn, timeoutMs) => {
  return async (...args) => {
    return withTimeout(fn(...args), timeoutMs);
  };
};

export default withTimeout;
