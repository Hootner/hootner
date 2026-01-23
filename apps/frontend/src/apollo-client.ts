import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// GraphQL API endpoint
const httpLink = createHttpLink({
  uri: 'https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/graphql',
})

// Add API key to headers
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-api-key': 'JRKRim1VCT1vYdSWQL19I6EUUUX0JO0J9DLc6AfN',
    },
  }
})

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
