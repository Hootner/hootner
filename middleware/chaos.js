/**
 * Chaos engineering middleware for testing resilience
 * Injects failures based on X-Chaos-Experiment header
 * Supported types: latency:ms, error:code, timeout, partial
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 */
export const _chaosMiddleware = (req, res, next) => {
  const chaosHeader = req.headers['x-chaos-experiment'];

  if (!chaosHeader) {
    return next();
  }

  const [type, value] = (chaosHeader || '').split(':');
  if (!type) {
    return next();
  }

  switch (type) {
    case 'latency': {
      const delay = Number.parseInt(value, 10) || 1000;
      setTimeout(next, delay);
      return;
    }

    case 'error': {
      const code = Number.parseInt(value, 10) || 500;
      return res.status(code).json({ error: 'Chaos experiment: forced error' });
    }

    case 'timeout':
      // Don't call next, simulate timeout
      break;

    case 'partial':
      if (Math.random() < 0.5) {
        return res.status(503).json({ error: 'Chaos experiment: random failure' });
      }
      return next();

    default:
      return next();
  }
};
