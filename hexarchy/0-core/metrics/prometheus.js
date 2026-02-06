// Prometheus Metrics Exporter
import prometheus from 'prom-client';

const { register, collectDefaultMetrics, Counter, Histogram, Gauge } = prometheus;

// Collect default metrics
collectDefaultMetrics({ register });

// HTTP request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Business metrics
export const videoUploads = new Counter({
  name: 'video_uploads_total',
  help: 'Total number of video uploads'
});

export const videoViews = new Counter({
  name: 'video_views_total',
  help: 'Total number of video views'
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of currently active users'
});

export const watchParties = new Gauge({
  name: 'watch_parties_active',
  help: 'Number of active watch parties'
});

// Payment metrics
export const paymentSuccess = new Counter({
  name: 'payments_successful_total',
  help: 'Total successful payments',
  labelNames: ['currency']
});

export const paymentFailed = new Counter({
  name: 'payments_failed_total',
  help: 'Total failed payments',
  labelNames: ['reason']
});

export const paymentAmount = new Counter({
  name: 'payment_amount_total',
  help: 'Total payment amount',
  labelNames: ['currency']
});

// Error metrics
export const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code']
});

// Middleware to track HTTP metrics
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });

  next();
};

// Metrics endpoint
export const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

export { register };
export default {
  httpRequestDuration,
  httpRequestTotal,
  videoUploads,
  videoViews,
  activeUsers,
  paymentSuccess,
  metricsMiddleware,
  metricsHandler
};
