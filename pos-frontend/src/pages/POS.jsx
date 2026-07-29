import { useState, useEffect } from 'react';
import { storeService, productService, billService } from '../services/endpoints';
import toast from 'react-hot-toast';
import './POS.css';

export default function POS() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [deliveryCost, setDeliveryCost] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { if (selectedStore) loadProducts(selectedStore); else setProducts([]); }, [selectedStore]);

  const loadStores = async () => {
    try { const res = await storeService.getAll(); setStores(res.data.data); } catch {}
  };

  const loadProducts = async (storeId) => {
    try { const res = await productService.getByStore(storeId); setProducts(res.data.data); } catch {}
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product_id: product.id, product_name: product.name, price: parseFloat(product.price), quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((item) => item.product_id !== productId));
    } else {
      setCart(cart.map((item) => item.product_id === productId ? { ...item, quantity: qty } : item));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = parseFloat(deliveryCost) || 0;
  const total = subtotal + delivery;

  const handleSaveBill = async () => {
    if (!selectedStore) return toast.error('Select a store');
    if (!customer.name) return toast.error('Customer name is required');
    if (cart.length === 0) return toast.error('Add at least one product');

    setSaving(true);
    try {
      await billService.create({
        store_id: parseInt(selectedStore),
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        delivery_cost: delivery,
        notes,
        items: cart,
      });
      toast.success('Bill saved successfully!');
      setCart([]);
      setCustomer({ name: '', phone: '', address: '' });
      setDeliveryCost('');
      setNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pos-page">
      <div className="pos-left">
        <div className="pos-store-select">
          <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
            <option value="">-- Select Store --</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="pos-products">
          {products.length === 0 ? (
            <div className="empty-state">
              {selectedStore ? 'No products in this store' : 'Select a store to view products'}
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card" onClick={() => addToCart(p)}>
                  <strong>{p.name}</strong>
                  <span className="product-price">{Number(p.price).toFixed(2)}</span>
                  {p.category_name && <small>{p.category_name}</small>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pos-right">
        <h2>Bill</h2>

        <div className="pos-customer">
          <input placeholder="Customer Name *" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          <input placeholder="Phone Number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
          <input placeholder="Delivery Address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
        </div>

        <div className="pos-cart">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>No items added</div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.product_name}</strong>
                  <small>{Number(item.price).toFixed(2)} each</small>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                  <span className="cart-item-total">{(item.price * item.quantity).toFixed(2)}</span>
                  <button className="btn-remove" onClick={() => removeFromCart(item.product_id)}>×</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pos-delivery">
          <input type="number" step="0.01" placeholder="Delivery Cost" value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)} />
          <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="pos-totals">
          <div className="total-row"><span>Subtotal:</span><span>{subtotal.toFixed(2)}</span></div>
          <div className="total-row"><span>Delivery:</span><span>{delivery.toFixed(2)}</span></div>
          <div className="total-row total-final"><span>Total:</span><span>{total.toFixed(2)}</span></div>
        </div>

        <button className="btn-primary pos-save-btn" onClick={handleSaveBill} disabled={saving}>
          {saving ? 'Saving...' : 'Save Bill'}
        </button>
      </div>
    </div>
  );
}
