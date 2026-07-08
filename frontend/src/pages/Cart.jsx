import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import './Pages.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }

    setCheckingOut(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems: cart.map(item => ({ id: item.id, quantity: item.quantity }))
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      // Success
      clearCart();
      setCheckoutSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="empty-state glass-card" style={{ maxWidth: '550px', margin: '3rem auto' }}>
        <CheckCircle size={60} style={{ color: 'var(--accent-color)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem', color: '#fff' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Thank you for shopping at GadgetGalaxy! Your order is being processed and will be shipped shortly. You can track its status in your profile portal.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Shop More
          </Link>
          <Link to="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-state glass-card">
        <ShoppingBag size={50} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
        <h3>Your shopping cart is empty</h3>
        <p style={{ margin: '0.5rem 0 1.5rem 0' }}>Looks like you haven't added any gadgets to your spacecraft yet.</p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          Explore Gadgets
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2 className="section-heading">Shopping Cart</h2>
      
      {error && (
        <div className="auth-error" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      <div className="cart-layout">
        {/* Left Column: Items */}
        <div className="cart-items-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-row glass-card">
              <img src={item.image_url} alt={item.name} className="cart-item-img" />
              
              <div className="cart-item-info">
                <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                <div className="cart-item-price" style={{ marginTop: '0.25rem' }}>${item.price.toFixed(2)}</div>
              </div>

              <div className="cart-item-actions">
                <div className="qty-selector">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn" disabled={item.quantity <= 1}>-</button>
                  <span className="qty-number">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn" disabled={item.quantity >= item.stock}>+</button>
                </div>

                <div style={{ fontWeight: 700, fontSize: '1rem', minWidth: '70px', textAlign: 'right' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button onClick={() => removeFromCart(item.id)} className="btn-remove-item" title="Remove Item">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Summary Box */}
        <div className="cart-summary-card glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', color: '#fff' }}>Order Summary</h3>
          
          <div className="summary-row">
            <span>Items Count</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Cyber-priority Shipping</span>
            <span style={{ color: 'var(--accent-color)' }}>FREE</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="btn-primary btn-checkout"
            disabled={checkingOut}
          >
            {checkingOut ? (
              'Processing Checkout...'
            ) : user ? (
              <>
                <CreditCard size={18} /> Place Order
              </>
            ) : (
              <>
                Sign In to Checkout <ArrowRight size={16} />
              </>
            )}
          </button>

          {!user && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.8rem' }}>
              Authentication is required to place order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
