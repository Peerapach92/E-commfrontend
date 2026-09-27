import { money } from '../format.js';
import Ransom from '../theme/Ransom.jsx';

export default function Confirmation({ order, onContinue }) {
  return (
    <div className="panel narrow cut">
      <h1 className="cut" style={{ '--i': 1 }}><Ransom text={`Order #${order.id} received`} /></h1>
      <p>
        We got your slip for {money(order.total)}. We will confirm your order once the payment is
        checked.
      </p>
      <ul className="summary-lines">
        {order.items.map((item) => (
          <li key={item.product_id}>
            <span>
              {item.name} <span className="muted">× {item.quantity}</span>
            </span>
            <span>{money(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <button className="key sfx" onClick={onContinue}>
        Keep shopping
      </button>
    </div>
  );
}
