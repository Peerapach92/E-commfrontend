import { useEffect, useRef, useState } from 'react';
import { checkout } from '../api.js';
import { money } from '../format.js';
import Ransom from '../theme/Ransom.jsx';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function Checkout({ cart, total, onBack, onPlaced, onApiError }) {
  const [slip, setSlip] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  // Show a thumbnail of the chosen slip; free the object URL when it changes.
  useEffect(() => {
    if (!slip) return setPreview('');
    const url = URL.createObjectURL(slip);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [slip]);

  function handleFile(e) {
    const file = e.target.files[0];
    setError('');
    if (!file) return setSlip(null);
    if (!ALLOWED.includes(file.type)) {
      setSlip(null);
      inputRef.current.value = '';
      return setError('The slip must be a JPG, PNG or WebP image.');
    }
    if (file.size > MAX_BYTES) {
      setSlip(null);
      inputRef.current.value = '';
      return setError('The slip must be 5 MB or smaller.');
    }
    setSlip(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!slip) return setError('Attach your payment slip to place the order.');
    setError('');
    setBusy(true);
    try {
      const { order } = await checkout(cart, slip);
      onPlaced(order);
    } catch (err) {
      onApiError(err);
      setError(err.message);
      setBusy(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="panel narrow cut">
        <h1><Ransom text="Checkout" /></h1>
        <p className="muted">Your cart is empty.</p>
        <button className="key" onClick={onBack}>
          Back to shop
        </button>
      </div>
    );
  }

  return (
    <form className="checkout" onSubmit={handleSubmit}>
      <div className="checkout-head cut">
        <button type="button" className="link" onClick={onBack}>
          ‹ Back to shop
        </button>
        <h1><Ransom text="Checkout" /></h1>
      </div>

      <div className="checkout-grid">
        <section className="panel cut" style={{ '--i': 1 }}>
          <h2>Order summary</h2>
          <ul className="summary-lines">
            {cart.map(({ product, quantity }) => (
              <li key={product.id}>
                <span>
                  {product.name} <span className="muted">× {quantity}</span>
                </span>
                <span>{money(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
        </section>

        <section className="panel cut" style={{ '--i': 2 }}>
          <h2>Upload your payment slip</h2>
          <p className="muted">
            Transfer {money(total)}, then attach the slip. We confirm your order once we have
            checked it.
          </p>

          <label className={`dropzone ${slip ? 'has-file' : ''}`}>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
            />
            {preview ? (
              <img src={preview} alt="Preview of your payment slip" />
            ) : (
              <span>Choose slip image (JPG, PNG or WebP, up to 5 MB)</span>
            )}
          </label>
          {slip && <p className="file-name">{slip.name}</p>}

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button className="key key-wide sfx" type="submit" disabled={busy || !slip}>
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </section>
      </div>
    </form>
  );
}
