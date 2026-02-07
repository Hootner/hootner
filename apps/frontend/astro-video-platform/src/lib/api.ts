const API_BASE = import.meta.env.PUBLIC_API_BASE || 'http://localhost:3005/api';

export const api = {
  async get<T>(path: string): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hootner_auth_token') : null;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return res.json();
  },
  
  async post<T>(path: string, data: unknown): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hootner_auth_token') : null;
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
