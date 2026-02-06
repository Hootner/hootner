// GraphQL API Configuration
export const graphqlConfig = {
  port: process.env.GRAPHQL_PORT || 4000,
  endpoint: '/graphql',
  playground: process.env.NODE_ENV !== 'production',
  introspection: process.env.NODE_ENV !== 'production',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  context: ({ req, res }) => ({
    req,
    res,
    user: req.user // From authentication middleware
  })
};

export default graphqlConfig;
