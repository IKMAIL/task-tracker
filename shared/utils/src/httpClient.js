const fetch = require('node-fetch');

// Thin HTTP client for inter-service calls.
// Throws on non-2xx responses so callers can catch cleanly.
const request = async (method, url, body, serviceToken) => {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(serviceToken ? { 'X-Service-Token': serviceToken } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error?.message || `HTTP ${res.status} from ${url}`);
    err.status = res.status;
    throw err;
  }

  return data;
};

module.exports = {
  get:    (url, token)        => request('GET',    url, undefined, token),
  post:   (url, body, token)  => request('POST',   url, body,      token),
  put:    (url, body, token)  => request('PUT',    url, body,      token),
  delete: (url, token)        => request('DELETE', url, undefined, token),
};
