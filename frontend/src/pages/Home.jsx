import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Info, SlidersHorizontal, ArrowRight } from 'lucide-react';
import './Pages.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';

  const categories = ['All', 'Laptops', 'Wearables', 'Audio', 'Accessories'];

  const setCategory = (newCat) => {
    const params = new URLSearchParams(searchParams);
    if (newCat === 'All') {
      params.delete('category');
    } else {
      params.set('category', newCat);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchKeyword) queryParams.append('keyword', searchKeyword);
        if (category && category !== 'All') queryParams.append('category', category);

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchKeyword, category]);

  // Helper to render a grid of product cards
  const renderProductGrid = (items) => (
    <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
      {items.map((product) => (
        <div key={product.id} className="product-card glass-card">
          <div className="product-img-container">
            <img src={product.image_url} alt={product.name} className="product-img" />
            <span className="product-category-badge">{product.category}</span>
          </div>

          <div className="product-body">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-desc">{product.description}</p>
            
            <div className="product-meta">
              <span className="product-price">${product.price.toFixed(2)}</span>
              {product.stock > 0 ? (
                <span className="badge badge-success">In Stock ({product.stock})</span>
              ) : (
                <span className="badge badge-danger">Out of Stock</span>
              )}
            </div>

            <div className="product-actions">
              <Link to={`/product/${product.id}`} className="btn-secondary btn-action-detail">
                <Info size={16} /> Details
              </Link>
              <button
                onClick={() => addToCart(product)}
                className="btn-primary btn-action-cart"
                disabled={product.stock === 0}
              >
                <ShoppingCart size={16} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Group products by category
  const laptops = products.filter(p => p.category === 'Laptops');
  const wearables = products.filter(p => p.category === 'Wearables');
  const audio = products.filter(p => p.category === 'Audio');
  const accessories = products.filter(p => p.category === 'Accessories');

  const showGroupedView = category === 'All' && !searchKeyword;

  // Auto-scrolling Advertising Slideshow component
  const AdBanner = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const ads = [
      {
        title: "Elevate Your Gaming Station",
        tagline: "Equip your battlestation with liquid-cooled rigs. Get 20% off on Mechanical Keyboards and esports mice this week.",
        badge: "GALAXY DEALS IN Accessories",
        color: "cyan",
        actionText: "Shop Gear Accessories",
        categoryLink: "Accessories",
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600"
      },
      {
        title: "Unleash Unrivaled Performance",
        tagline: "Intel i9 14th Gen processor and RTX 4090 configurations of Apex Blade 16 gaming laptops are now back in stock.",
        badge: "EXCLUSIVE STATIONS LAUNCH",
        color: "purple",
        actionText: "Browse Stations",
        categoryLink: "Laptops",
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600"
      },
      {
        title: "Explore Virtual Realities",
        tagline: "State-of-the-art inside-out trackers, spatial audio headphone modules, and AeroGlow systems available today.",
        badge: "NEXT-GEN WEARABLES",
        color: "green",
        actionText: "Shop VR Systems",
        categoryLink: "Wearables",
        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=600"
      }
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % ads.length);
      }, 4500);
      return () => clearInterval(timer);
    }, []);

    const activeAd = ads[activeIndex];

    return (
      <div className={`ad-banner glass-card ad-banner-${activeAd.color}`} style={{
        display: 'flex',
        minHeight: '260px',
        position: 'relative',
        overflow: 'hidden',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
        transition: 'var(--transition)'
      }}>
        {/* Ad Text details */}
        <div style={{ flex: '1.2 1 320px', zIndex: 2 }}>
          <span className={`badge ${activeAd.color === 'cyan' ? 'badge-info' : activeAd.color === 'purple' ? 'badge-warning' : 'badge-success'}`} style={{ marginBottom: '1rem' }}>
            {activeAd.badge}
          </span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.8rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
            {activeAd.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '520px' }}>
            {activeAd.tagline}
          </p>
          <button onClick={() => setCategory(activeAd.categoryLink)} className="btn-primary" style={{ padding: '0.65rem 1.3rem', fontSize: '0.85rem' }}>
            {activeAd.actionText} <ArrowRight size={14} />
          </button>
        </div>

        {/* Ad Image right */}
        <div className="ad-banner-graphic" style={{ flex: '0.8 1 240px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
          <img 
            src={activeAd.image} 
            alt={activeAd.title} 
            style={{ width: '280px', height: '170px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
          />
        </div>

        {/* Slide Indicators Dots */}
        <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 3 }}>
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: idx === activeIndex ? '22px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: idx === activeIndex ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            />
          ))}
        </div>

        {/* Ambient glows inside banner */}
        <div className="hero-decoration" style={{ opacity: 0.4 }}>
          <div className={`glow-sphere ${activeAd.color === 'cyan' ? 'cyan-sphere' : activeAd.color === 'purple' ? 'purple-sphere' : 'green-sphere'}`} style={{ filter: 'blur(80px)' }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page">
      {/* Dynamic Auto-Scrolling Slideshow Ads Banner */}
      <AdBanner />

      {/* Category Selection Filter Bar */}
      <section className="control-bar glass-card" style={{ padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <SlidersHorizontal size={18} style={{ color: 'var(--primary-color)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filter Catalog:</span>
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`category-tab-btn ${category === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Catalog Render Panel */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state glass-card">
          <h3>No gadget matched your search query</h3>
          <p>Try checking your spelling or selecting a different category filter.</p>
        </div>
      ) : showGroupedView ? (
        /* Categorized Grouped Layout */
        <div className="grouped-catalog">
          
          {/* Laptops Section */}
          {laptops.length > 0 && (
            <div className="category-group-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h2 className="section-heading" style={{ margin: 0 }}>Laptops & Stations</h2>
                <button onClick={() => setCategory('Laptops')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                  View All Laptops <ArrowRight size={12} />
                </button>
              </div>
              {renderProductGrid(laptops)}
            </div>
          )}

          {/* Wearables Section */}
          {wearables.length > 0 && (
            <div className="category-group-section" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h2 className="section-heading" style={{ margin: 0 }}>Wearable Systems</h2>
                <button onClick={() => setCategory('Wearables')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                  View All Wearables <ArrowRight size={12} />
                </button>
              </div>
              {renderProductGrid(wearables)}
            </div>
          )}

          {/* Audio Section */}
          {audio.length > 0 && (
            <div className="category-group-section" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h2 className="section-heading" style={{ margin: 0 }}>Hi-Fi Audio Systems</h2>
                <button onClick={() => setCategory('Audio')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                  View All Audio <ArrowRight size={12} />
                </button>
              </div>
              {renderProductGrid(audio)}
            </div>
          )}

          {/* Accessories Section */}
          {accessories.length > 0 && (
            <div className="category-group-section" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h2 className="section-heading" style={{ margin: 0 }}>Gear & Accessories</h2>
                <button onClick={() => setCategory('Accessories')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                  View All Gear <ArrowRight size={12} />
                </button>
              </div>
              {renderProductGrid(accessories)}
            </div>
          )}

        </div>
      ) : (
        /* Normal Filtered Grid View (Either a single category is active, or a search filter is active) */
        <div className="filtered-catalog">
          <h2 className="section-heading">
            {searchKeyword ? `Search Results for "${searchKeyword}"` : `${category} Catalog`}
          </h2>
          {renderProductGrid(products)}
        </div>
      )}
    </div>
  );
};

export default Home;
