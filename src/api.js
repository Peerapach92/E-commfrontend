// Small fetch wrapper. Every call goes to /api (nginx or the Vite dev proxy forwards it).
const SESSION_KEY = 'persona.session';

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', json, formData } = {}) {
  const headers = {};
  const token = loadSession()?.token;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: json ? JSON.stringify(json) : formData,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong.', res.status);
  return data;
}

export const login = (username, password) =>
  request('/login', { method: 'POST', json: { username, password } });

export const register = (username, password) =>
  request('/register', { method: 'POST', json: { username, password } });

export const getProducts = () => request('/products');

export const adminAddProduct = (name, price, image_url) =>
  request('/admin/products', { method: 'POST', json: { name, price, image_url } });

export const adminDeleteProduct = (id) =>
  request(`/admin/products/${id}`, { method: 'DELETE' });

export function checkout(cart, slipFile) {
  const formData = new FormData();
  formData.append(
    'cart_items',
    JSON.stringify(cart.map(({ product, quantity }) => ({ product_id: product.id, quantity })))
  );
  formData.append('slip', slipFile);
  return request('/checkout', { method: 'POST', formData });
}
