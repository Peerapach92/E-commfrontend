import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, getProducts, loadSession, saveSession } from './api.js';
import Login from './components/Login.jsx';
import Shop from './components/Shop.jsx';
import Checkout from './components/Checkout.jsx';
import Confirmation from './components/Confirmation.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import Backdrop from './theme/Backdrop.jsx';
import Cursor from './theme/Cursor.jsx';
import { HudTop, HudBottom } from './theme/Hud.jsx';
import { useTransition } from './theme/transition.js';
import { playSelect } from './theme/sfx.js';
import { useThemeAudioSync } from './theme/useThemeAudioSync.js';

const cartKey = (username) => `persona.cart.${username}`;

function loadCart(username) {
  try {
    return JSON.parse(localStorage.getItem(cartKey(username))) || {};
  } catch {
    return {};
  }
}

export default function App() {
  useThemeAudioSync(); // เชื่อมธีม ↔ เพลง: ธีมเปลี่ยนเมื่อไหร่ เพลงสลับตามอัตโนมัติ

  const [session, setSession] = useState(loadSession);
  const [products, setProducts] = useState([]);
  const [productsState, setProductsState] = useState('loading'); // loading | ready | error
  const [productsError, setProductsError] = useState('');
  const [cartItems, setCartItems] = useState({}); // { [productId]: quantity }
  const [view, setView] = useState('shop'); // shop | checkout | confirmation | admin
  const [order, setOrder] = useState(null);

  const goInstant = useTransition(); // สลับหน้าทันที ไม่มีม่าน (ดู theme/transition.js)

  // เปลี่ยนหน้า: เล่นเสียง select แล้วสลับ view ทันที
  const goTo = useCallback(
    (next) => {
      playSelect();
      goInstant(() => {
        setView(next);
        window.scrollTo(0, 0);
      }, next);
    },
    [goInstant]
  );

  // ล้าง session จริง ๆ — เรียกจากทั้งปุ่ม Sign out และตอน token หมดอายุ
  const clearSession = useCallback(() => {
    saveSession(null);
    setSession(null);
    setProducts([]);
    setCartItems({});
    setView('shop');
    setOrder(null);
  }, []);

  // ปุ่ม Sign out: กลับหน้า login ทันที
  const signOut = useCallback(() => {
    playSelect();
    goInstant(clearSession, 'login');
  }, [goInstant, clearSession]);

  const handleApiError = useCallback(
    (err) => {
      // An expired or invalid token sends the user back to the login page.
      if (err instanceof ApiError && err.status === 401) clearSession();
    },
    [clearSession]
  );

  // Load the product list (and the saved cart) whenever someone is signed in.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setCartItems(loadCart(session.username));
    setProductsState('loading');
    getProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
        setProductsState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        handleApiError(err);
        setProductsError(err.message);
        setProductsState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [session, handleApiError]);

  // ESC = ถอยกลับหน้าร้าน (ตาม HUD ด้านล่างจอ)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (view === 'checkout' || view === 'admin') goTo('shop');
      else if (view === 'confirmation') {
        setOrder(null);
        goTo('shop');
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [view, goTo]);

  // Keep the cart across page reloads.
  useEffect(() => {
    if (session) localStorage.setItem(cartKey(session.username), JSON.stringify(cartItems));
  }, [cartItems, session]);

  // Cart lines with full product info; items that no longer exist are dropped.
  const cart = useMemo(
    () =>
      products
        .filter((p) => cartItems[p.id] > 0)
        .map((product) => ({ product, quantity: cartItems[product.id] })),
    [products, cartItems]
  );
  const itemCount = cart.reduce((n, line) => n + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  // แอนิเมชันระดับ component (ไม่ใช่ transition ระหว่างหน้า): ป้ายตะกร้ากระตุกสั้น ๆ
  // ทุกครั้งที่ของในตะกร้าเพิ่มขึ้น ให้ความรู้สึกตอบสนองทันทีตอนกดเพิ่มสินค้า
  const prevCount = useRef(itemCount);
  const [cartBump, setCartBump] = useState(false);
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setCartBump(true);
      const id = setTimeout(() => setCartBump(false), 380);
      prevCount.current = itemCount;
      return () => clearTimeout(id);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  const setQuantity = (productId, quantity) =>
    setCartItems((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[productId];
      else next[productId] = Math.min(quantity, 99);
      return next;
    });

  const addToCart = (productId) => setQuantity(productId, (cartItems[productId] || 0) + 1);

  // ล็อกอินสำเร็จ: เข้าหน้าร้านทันที
  const handleLogin = (newSession) => {
    goInstant(() => {
      saveSession(newSession);
      setSession(newSession);
      window.scrollTo(0, 0);
    }, 'shop');
  };

  const handleOrderPlaced = (placedOrder) => {
    setCartItems({});
    setOrder(placedOrder);
    goTo('confirmation');
  };

  return (
    <>
      <Cursor />
      {!session ? (
        <>
          <Backdrop screen="login" />
          <Login onLogin={handleLogin} />
        </>
      ) : (
        <div className="app" data-screen={view}>
          <Backdrop screen={view} />
          <HudTop left="PERSONA // DESK GEAR" right={`SIGNED IN AS ${session.username.toUpperCase()}`} />

          <header className="topbar">
            <span className="wordmark">persona</span>
            <div className="topbar-actions">
              <span className="who">{session.username}</span>
              {view === 'shop' && (
                <a className="cart-link" href="#cart">
                  Cart
                  <span
                    className={`cart-count${cartBump ? ' bump' : ''}`}
                    aria-label={`${itemCount} items in cart`}
                  >
                    {itemCount}
                  </span>
                </a>
              )}
              {session.role === 'admin' && view !== 'admin' && (
                <button className="key key-quiet" onClick={() => goTo('admin')}>
                  Dashboard
                </button>
              )}
              <button className="key key-quiet" onClick={signOut}>
                Sign out
              </button>
            </div>
          </header>

          <main className="page" key={view}>
            {view === 'shop' && (
              <Shop
                products={products}
                state={productsState}
                error={productsError}
                cart={cart}
                cartItems={cartItems}
                itemCount={itemCount}
                total={total}
                onAdd={addToCart}
                onSetQuantity={setQuantity}
                onCheckout={() => goTo('checkout')}
              />
            )}
            {view === 'checkout' && (
              <Checkout
                cart={cart}
                total={total}
                onBack={() => goTo('shop')}
                onPlaced={handleOrderPlaced}
                onApiError={handleApiError}
              />
            )}
            {view === 'confirmation' && (
              <Confirmation
                order={order}
                onContinue={() => {
                  setOrder(null);
                  goTo('shop');
                }}
              />
            )}
            {view === 'admin' && session.role === 'admin' && (
              <AdminDashboard
                products={products}
                onBack={() => goTo('shop')}
                onProductsChanged={setProducts}
                onApiError={handleApiError}
              />
            )}
          </main>

          <HudBottom
            hints={
              view === 'shop'
                ? [['CLICK', 'SELECT'], ['ENTER', 'CONFIRM']]
                : [['ESC', 'BACK'], ['ENTER', 'CONFIRM']]
            }
          />
        </div>
      )}
    </>
  );
}
