# Constants Module

Centralized constants to eliminate magic numbers across the codebase.

## Usage

```javascript
const { HTTP_STATUS, TIMEOUTS, LIMITS, ANIMATION, CACHE, MISC } = require('./constants')

// HTTP Status Codes
res.status(HTTP_STATUS.OK).json({ data })
res.status(HTTP_STATUS.NOT_FOUND).json({ error })

// Timeouts
setTimeout(callback, TIMEOUTS.FIVE_SECONDS)
cache.set(key, value, TIMEOUTS.ONE_HOUR)

// Limits
if (input.length > LIMITS.MAX_STRING_LENGTH) {
}
if (port > LIMITS.MAX_PORT) {
}

// Animation
element.style.transition = `opacity ${ANIMATION.FADE_DURATION}ms`

// Cache
res.setHeader('Cache-Control', `max-age=${CACHE.ONE_DAY}`)

// Miscellaneous
const year = MISC.YEAR_2021
```

## Files

- `http-status.js` - HTTP status codes (200, 404, 500, etc.)
- `timeouts.js` - Time durations in milliseconds
- `limits.js` - System limits and boundaries
- `animation.js` - Animation durations
- `cache.js` - Cache durations in seconds
- `misc.js` - Other constants
- `index.js` - Main export
