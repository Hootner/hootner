/**
 * GraphQL Resolvers - Main Entry Point
 * Combines all resolvers with error boundaries
 *
 * Author: HOOTNER Code Guardian
 * Date: January 10, 2026
 */

const queryResolvers = require('./queries');
const mutationResolvers = require('./mutations');
const subscriptionResolvers = require('./subscriptions');
const typeResolvers = require('./types');
const { GraphQLDateTime, GraphQLJSON } = require('graphql-scalars');
const { GraphQLUpload } = require('graphql-upload');
const { withErrorBoundary } = require('../utils/errorBoundary');

/**
 * Combined resolvers with error boundaries
 */
const resolvers = {
    // Custom Scalars
    DateTime: GraphQLDateTime,
    JSON: GraphQLJSON,
    Upload: GraphQLUpload,

    // Queries
    Query: withErrorBoundary(queryResolvers, 'Query'),

    // Mutations
    Mutation: withErrorBoundary(mutationResolvers, 'Mutation'),

    // Subscriptions
    Subscription: subscriptionResolvers,

    // Type Resolvers
    ...typeResolvers,
};

module.exports = resolvers;
