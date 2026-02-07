// Minimal GraphQL client for static HTML pages
// Uses window.HOOTNER_CONFIG.GRAPHQL_ENDPOINT
(function(){
  var endpoint = (window.HOOTNER_CONFIG && window.HOOTNER_CONFIG.GRAPHQL_ENDPOINT) || 'http://localhost:4000/graphql';

  async function request(body, headers){
    var h = Object.assign({ 'Content-Type': 'application/json' }, headers || {});
    var res = await fetch(endpoint, { method: 'POST', headers: h, body: JSON.stringify(body) });
    var json = await res.json();
    if (json.errors) throw json.errors;
    return json.data;
  }

  window.GraphQLClient = {
    query: function(query, variables, headers){ return request({ query: query, variables: variables || {} }, headers); },
    mutate: function(mutation, variables, headers){ return request({ query: mutation, variables: variables || {} }, headers); }
  };
})();
