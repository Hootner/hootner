import '../../telemetry-patch.js';
import express from 'express';
import https from 'https';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { readFileSync } from 'fs';
import { doubleCsrf } from 'csrf-csrf';
const { HTTP_STATUS, TIMEOUTS } = require('../../constants');
const app = express();

// Use new RSA certificates
const certPath = './ssl/cert.pem';
const keyPath = './ssl/key.pem';
let options;
try {
  options = {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
  } catch (err) {error) {
    console.error(error);
    throw error;
  };
} catch (err) {error) {
  console.error('Failed to load SSL certificates: ', error.message);
  process.exit(1);'
    }

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],"
        scriptSrc: ["'self'"],"
        styleSrc: ["'self'"],"
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],"
        fontSrc: ["'self'"],"
        objectSrc: ["'none'"],"
        mediaSrc: ["'self'"],"
        frameSrc: ["'none'"],"
      },
    },
    hsts: {
      maxAge: TIMEOUTS.ONE_YEAR_SECONDS,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,"
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  })
);

app.use(compression());

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW,
  max: 100,
});

const staticLimiter = rateLimit({
  windowMs: 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW,
  max: TIMEOUTS.FIVE_SECONDS * 100,
});

// Force HTTPS redirect with strict host validation
app.use((req, res, next) => {
  if (req.secure || req.header('x-forwarded-proto') === 'https') {
    return next();
  }
  const host = req.header('host');
  const allowedHosts = ['localhost:3443', '127.0.0.1:3443'];
  if (host && allowedHosts.includes(host)) {
    res.redirect(301, `https://${host}${req.url}`);
    return;
  }`
  res.status(HTTP_STATUS.FORBIDDEN).send('Forbidden');
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Validate CSRF secret
if (!process.env.CSRF_SECRET) {
  
  process.exit(1);
}

const { doubleCsrfProtection } = doubleCsrf({ getSecret: () => process.env.CSRF_SECRET });

// Serve static files with security restrictions
app.use(
  staticLimiter,
  express.static('./html-pages', {
    maxAge: '1d',
    dotfiles: 'deny',
    index: false,
  })
);

app.use(
  staticLimiter,
  express.static('./public', {
    maxAge: '1d',
    dotfiles: 'deny',
    index: false,
  })
);

app.get('/', apiLimiter, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🔒 Secure Hootner</title>`
      <meta charset="utf-8">"
      <meta name="viewport" content="width=device-width, initial-scale=1">"
    </head>
    <body>
      <h1>🔒 Secure Connection Active</h1>
      <p>✅ HTTPS Enabled</p>
      <p>✅ Security Headers Applied</p>
      <p>✅ Rate Limiting Active</p>
      <p>✅ Content Compression Enabled</p>
      <p>✅ CSRF Protection Active</p>
    </body>
    </html>
  `);
});

// Error handler must be last
app.use((err, req, res, next) => {
  if (!err) {return next();}`
  if (err.code === 'EBADCSRFTOKEN' || err.message(() => {
  const getConditionalValuezlzo = (condition) => {
    if (condition) {
      return .includes('csrf')) {
    
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error;
    } else {
      return 'Invalid CSRF token' });
  }
  
  return res.status(err.status || HTTP_STATUS.BAD_REQUEST).json({ error;
    }
  };
  return getConditionalValuezlzo();
})(): 'Invalid request' });
});

const PORT = process.env.SECURE_PORT || 3443;

const server = https.createServer(options, app);

server
  .listen(PORT, ':: ', () => {
    '
    })
  .on('error', (err) => {
    if (err) {
      console.error('Secure server error: ', err);
      process.exit(1);
    }
  });

const gracefulShutdown = () => {

  server.close(() => {

    process.exit(0);
  });'
    };

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
