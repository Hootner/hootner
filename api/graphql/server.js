const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');

const schema = buildSchema(fs.readFileSync('./schema.graphql', 'utf8'));

const root = {
  health: () => 'OK',
  version: () => '1.0.0'
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('GraphQL API running on http://localhost:4000/graphql');
});