// Shared configuration for UI pages (static surface)
// Override these values before including pages if needed:
// <script>window.HOOTNER_CONFIG = { API_BASE_URL: '...', GRAPHQL_ENDPOINT: '...', STRIPE_PUBLISHABLE_KEY: '...' };</script>
// <script src="/path/to/config.js"></script>

(function(){
  window.HOOTNER_CONFIG = Object.assign({
    API_BASE_URL: 'http://localhost:4000',
    GRAPHQL_ENDPOINT: 'http://localhost:4000/graphql',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
    // Optional infra keys for asset/URL alignment when available
    CLOUDFRONT_URL: '',
    S3_BUCKET: '',
  }, window.HOOTNER_CONFIG || {});
})();
