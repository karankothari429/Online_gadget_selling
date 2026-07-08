import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import './Pages.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          // If not found, go back
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleQtyChange = (type) => {
    if (type === 'dec' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'inc' && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="detail-page">
      <Link to="/" className="btn-secondary" style={{ marginBottom: '2rem', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="detail-layout glass-card">
        {/* Left Column: Image */}
        <div className="detail-img-container">
          <img src={product.image_url} alt={product.name} className="detail-img" />
        </div>

        {/* Right Column: Meta Info */}
        <div className="detail-info">
          <div>
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-title" style={{ marginTop: '0.5rem' }}>{product.name}</h1>
          </div>

          <div className="detail-price">${product.price.toFixed(2)}</div>

          <p className="detail-desc">{product.description}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: '0.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#10B981' }}>
              <ShieldCheck size={16} /> <span>1-Year Official Galaxy Warranty Included</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#60A5FA' }}>
              <Truck size={16} /> <span>Free Cyber-Priority Shipping (Domestic)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#F59E0B' }}>
              <RefreshCw size={16} /> <span>30-Day Hassle-Free Return Policy</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Inventory Status</span>
              {product.stock > 0 ? (
                <span className="badge badge-success">Available ({product.stock} units)</span>
              ) : (
                <span className="badge badge-danger">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="qty-selector-container">
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Quantity</span>
                <div className="qty-selector">
                  <button onClick={() => handleQtyChange('dec')} className="qty-btn" disabled={quantity <= 1}>-</button>
                  <span className="qty-number">{quantity}</span>
                  <button onClick={() => handleQtyChange('inc')} className="qty-btn" disabled={quantity >= product.stock}>+</button>
                </div>
              </div>
            )}
          </div>

          <div className="detail-action-buttons">
            <button
              onClick={() => addToCart(product, quantity)}
              className="btn-primary btn-detail-cart"
              disabled={product.stock === 0}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Tech Specifications */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="specs-section glass-card">
          <h2 className="section-heading">Technical Specifications</h2>
          <table className="specs-table">
            <tbody>
              {Object.entries(product.specs).map(([key, val]) => (
                <tr key={key}>
                  <td className="specs-key">{key}</td>
                  <td className="specs-value">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
