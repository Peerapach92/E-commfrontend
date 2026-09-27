import { useState } from 'react';
import { adminAddProduct, adminDeleteProduct } from '../api.js';
import { money } from '../format.js';
import Ransom from '../theme/Ransom.jsx';
import { playSelect } from '../theme/sfx.js';

// Admin-only screen: add new products straight into the shop, or remove existing ones.
export default function AdminDashboard({ products, onBack, onProductsChanged, onApiError }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const priceNum = Number(price);
    if (!name.trim()) return setError('Enter a product name.');
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError('Enter a valid price.');

    setError('');
    setBusy(true);
    playSelect();
    try {
      const product = await adminAddProduct(name.trim(), priceNum, imageUrl.trim());
      onProductsChanged((prev) => [...prev, product]);
      setName('');
      setPrice('');
      setImageUrl('');
    } catch (err) {
      onApiError(err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    setDeletingId(id);
    playSelect();
    try {
      await adminDeleteProduct(id);
      onProductsChanged((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      onApiError(err);
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin">
      <div className="checkout-head cut">
        <button type="button" className="link" onClick={onBack}>
          ‹ Back to shop
        </button>
        <h1><Ransom text="Admin dashboard" /></h1>
      </div>

      <div className="checkout-grid">
        <section className="panel cut" style={{ '--i': 1 }}>
          <h2>Add a product</h2>

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
            </label>

            <label className="field">
              <span>Price (THB)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Image URL</span>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
              <small>Optional — leave blank for no image.</small>
            </label>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <button className="key key-wide sfx" type="submit" disabled={busy}>
              {busy ? 'Adding…' : 'Add to shop'}
            </button>
          </form>
        </section>

        <section className="panel cut" style={{ '--i': 2 }}>
          <h2>Current products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="muted">No products yet.</p>
          ) : (
            <ul className="summary-lines">
              {products.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <span className="admin-row-actions">
                    {money(p.price)}
                    <button
                      type="button"
                      className="key key-small key-quiet"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? 'Removing…' : 'Remove'}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
