import { money } from '../format.js';
import { playSelect } from '../theme/sfx.js';

export default function Cart({ cart, itemCount, total, onSetQuantity, onCheckout, cardIndex = 1 }) {
  return (
    <aside className="cart panel cut" style={{ '--i': cardIndex }} id="cart" aria-label="Shopping cart">
      <h2>Your cart</h2>

      {cart.length === 0 ? (
        <p className="muted">Your cart is empty. Add something from the list.</p>
      ) : (
        <>
          <ul className="cart-lines">
            {cart.map(({ product, quantity }) => (
              <li key={product.id}>
                <div className="cart-line-top">
                  <span className="cart-name">{product.name}</span>
                  <span className="cart-sub">{money(product.price * quantity)}</span>
                </div>
                <div className="stepper">
                  <button
                    className="key key-small key-quiet"
                    onClick={() => {
                      playSelect();
                      onSetQuantity(product.id, quantity - 1);
                    }}
                    aria-label={`Remove one ${product.name}`}
                  >
                    −
                  </button>
                  <span className="qty" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    className="key key-small key-quiet"
                    onClick={() => {
                      playSelect();
                      onSetQuantity(product.id, quantity + 1);
                    }}
                    aria-label={`Add one ${product.name}`}
                  >
                    +
                  </button>
                  <button
                    className="link"
                    onClick={() => {
                      playSelect();
                      onSetQuantity(product.id, 0);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <span>
              Total ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <strong>{money(total)}</strong>
          </div>

          <button className="key key-wide sfx" onClick={onCheckout}>
            Checkout
          </button>
        </>
      )}
    </aside>
  );
}
