# GraphQL Server Configuration

## Schema Files

The GraphQL API has two schema options:

### 1. **schema-enhanced.graphql** (ACTIVE - Production)

- **570 lines** - Complete production schema
- **Features:**
  - 15+ Query operations
  - 20+ Mutation operations
  - 10+ Subscription types
  - Real-time video streaming
  - AI video generation
  - Authentication & payments
  - Analytics & monitoring
- **Used by:** `server-enhanced.js` (default)
- **Status:** ✅ Active

### 2. **schema.graphql** (Legacy - Basic)

- **12 lines** - Minimal schema
- **Features:**
  - Basic health check
  - Empty mutation/subscription placeholders
- **Used by:** `server.js` (legacy)
- **Status:** 📦 Archived

---

## Active Configuration

**Current Server:** `server-enhanced.js`
**Active Schema:** `schema-enhanced.graphql`
**Port:** 4000
**Subscriptions:** Enabled (WebSocket)

### Start Commands

```bash
# Production server (enhanced schema)
npm start

# Development with hot reload
npm run dev

# Legacy server (basic schema)
npm run start:legacy
```

---

## Schema Selection

To change which schema is loaded, edit `server-enhanced.js`:

```javascript
// Current (line 26-29)
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema-enhanced.graphql'),
  'utf8'
);

// To use basic schema (not recommended)
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);
```

---

## Environment Variables

Configure schema features via `.env`:

```bash
# Server
PORT=4000
NODE_ENV=production

# Features (set to 'false' to disable)
ENABLE_SUBSCRIPTIONS=true
ENABLE_FILE_UPLOADS=true
ENABLE_INTROSPECTION=true

# Schema
GRAPHQL_SCHEMA_FILE=schema-enhanced.graphql
```

---

## Documentation

- **[README.md](README.md)** - API usage and examples
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Architecture details
- **[schema-enhanced.graphql](schema-enhanced.graphql)** - Full schema definition

---

## Recommendation

✅ **Use `schema-enhanced.graphql`** for all new development.

This schema includes:

- Complete type system
- Real-time subscriptions
- Error handling
- Authentication
- Video streaming
- AI generation

The basic `schema.graphql` is kept for backward compatibility only.
