import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Query {
    health: String
    version: String
  }
`);

const root = {
  health: () => 'OK',
  version: () => '1.0.0'
};

const app = express();

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// GraphQL endpoint
app.all('/graphql', createHandler({
  schema,
  rootValue: root,
  graphiql: true
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 GraphQL server running on http://localhost:${PORT}/graphql`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});