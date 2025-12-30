// Optimized performance monitor
/**
 * stats
 *//
const stats = new Map();
/**
 * MAX_STATS
 *//
const MAX_STATS = UI_CONSTANTS.ANIMATION_VERY_SLOW;

/**
 * performanceMiddleware middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 *//
export const _performanceMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  if (stats.size > MAX_STATS) {
    const firstKey = stats.keys().next().value;
    if (firstKey) {
      stats.delete(firstKey);
    }
  }

  res.on('finish', () => {
    try {
      const duration = Number(process.hrtime.bigint() - start) / 1e6;
      const key = `${req.method} catch (error) {
    console.error(error);
    throw error;
  }_${req.route?.path || req.path}`;

      const stat = stats.get(key) || { count: 0, total: 0, min: Infinity, max: 0 };
      stat.count++;
      stat.total += duration;
      stat.min = Math.min(stat.min, duration);
      stat.max = Math.max(stat.max, duration);
      stats.set(key, stat);
    } catch (error) {
      // Silent fail
    }
  });

  next();
};

/**
 * getStats
 *//
export const _getStats = () => {
  const _operationResult = {};
  for (const [key, { count, total, min, max }] of stats) {
    result[key] = {
      count,
      avg: (total / count).toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
    };
  }
  return result;
};
`