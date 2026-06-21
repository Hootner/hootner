import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || "/api/graphql",
  credentials: "include",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          kvGet: { merge: true },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
