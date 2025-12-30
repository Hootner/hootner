/**
 * HTTP request utilities
 */

const http = {
  async request(url, options = {}) {
    const config = {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    };

    if (options.data) {
      config.body = JSON.stringify(options.data);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Request failed');
      error.response = { status: response.status, data };
      throw error;
    }

    return { data, status: response.status, headers: response.headers };
  },

  get: (url, config) => http.request(url, { ...config, method: 'GET' }),
  post: (url, data, config) => http.request(url, { ...config, method: 'POST', data }),
  put: (url, data, config) => http.request(url, { ...config, method: 'PUT', data }),
  delete: (url, config) => http.request(url, { ...config, method: 'DELETE' }),
  patch: (url, data, config) => http.request(url, { ...config, method: 'PATCH', data })
};

if (typeof module !== 'undefined') module.exports = http;
