import queryResolvers from './queries.js'
import mutationResolvers from './mutations.js'
import subscriptionResolvers from './subscriptions.js'
import typeResolvers from './types.js'
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import { wrapResolvers } from '../utils/errorBoundary.js'

const resolvers = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
  Upload: GraphQLUpload,
  Query: wrapResolvers(queryResolvers, 'Query'),
  Mutation: wrapResolvers(mutationResolvers, 'Mutation'),
  Subscription: subscriptionResolvers,
  ...typeResolvers,
}

export default resolvers
