import { useState } from 'react';
import { money } from '../format.js';
import Cart from './Cart.jsx';
import Ransom from '../theme/Ransom.jsx';
import { playSelect } from '../theme/sfx.js';
import { ProductGridSkeleton, SkelBlock } from './Skeleton.jsx';

function ProductCard({ product, inCart, onAdd, index }) {
  // รูปสินค้าโหลดจากเน็ตแยกจาก state === 'ready' ของทั้งหน้า จึงมี shimmer ของ
  // ตัวเองอีกชั้น กันไม่ให้เห็นช่องว่าง/รูปแตกโพล่งขึ้นมาทันทีตอนโหลดเสร็จ
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // แอนิเมชันระดับ component: การ์ดเด้งสั้น ๆ ตอนกดเพิ่มลงตะกร้า (ฟีดแบ็กทันที
  // ที่ตัวการ์ดเอง ไม่ใช่การเคลื่อนไหวตอนเปลี่ยนหน้า)
  const [justAdded, setJustAdded] = useState(false);

  return (
    <article className={`product panel${justAdded ? ' added' : ''}`} style={{ '--i': index + 1 }}>
      <div className="product-img">
        {!imgLoaded && !imgFailed && <SkelBlock className="skel-img" style={{ position: 'absolute', inset: 0 }} />}
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity .25s' }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
        />
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <div className="price-row">
          <p className="price">{money(product.price)}</p>
          {inCart > 0 && <span className="in-cart">{inCart} in cart</span>}
        </div>
        <button
          className="key key-wide product-add sfx"
          onClick={() => {
            playSelect();
            onAdd();
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 320);
          }}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

export default function Shop({
  products,
  state,
  error,
  cart,
  cartItems,
  itemCount,
  total,
  onAdd,
  onSetQuantity,
  onCheckout,
}) {
  return (
    <div className="shop">
      <section>
        <h1 className="cut"><Ransom text="Desk gear" /></h1>

        {state === 'error' && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {state === 'ready' && products.length === 0 && (
          <p className="muted">No products are available yet.</p>
        )}

        {state === 'loading' ? (
          <>
            <p className="sr-only" role="status">Loading products…</p>
            <ProductGridSkeleton count={6} />
          </>
        ) : (
          <div className="grid">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                index={i}
                product={p}
                inCart={cartItems[p.id] || 0}
                onAdd={() => onAdd(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Cart
        cardIndex={products.length + 1}
        cart={cart}
        itemCount={itemCount}
        total={total}
        onSetQuantity={onSetQuantity}
        onCheckout={onCheckout}
      />
    </div>
  );
}
