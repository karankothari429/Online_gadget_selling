import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Cpu,
  Plus,
  Edit,
  Trash2,
  X,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import './Pages.css';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // Stats / Metrics
  const [stats, setStats] = useState({
    metrics: { totalSales: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 },
    recentOrders: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Products Table
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Orders Table
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Product Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Laptops');
  const [formStock, setFormStock] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formSpecs, setFormSpecs] = useState(''); // Textarea with JSON syntax (e.g. Key: Value)

  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  // Fetch Dashboard statistics
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Products Catalog
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products list:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching admin orders list:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchOrders();
  }, [token]);

  // Open Modal for adding product
  const openAddModal = () => {
    setModalType('add');
    setSelectedProductId(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCategory('Laptops');
    setFormStock('');
    setFormImage('');
    setFormSpecs(JSON.stringify({
      "Processor": "Intel Core i7",
      "Memory": "16GB DDR5",
      "Storage": "512GB SSD"
    }, null, 2));
    setFormError('');
    setShowProductModal(true);
  };

  // Open Modal for editing product
  const openEditModal = (product) => {
    setModalType('edit');
    setSelectedProductId(product.id);
    setFormName(product.name);
    setFormDesc(product.description || '');
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormStock(product.stock);
    setFormImage(product.image_url || '');
    setFormSpecs(JSON.stringify(product.specs || {}, null, 2));
    setFormError('');
    setShowProductModal(true);
  };

  // Submit Product Add/Edit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);

    let parsedSpecs = {};
    try {
      if (formSpecs.trim()) {
        parsedSpecs = JSON.parse(formSpecs);
      }
    } catch (err) {
      setFormError('Technical specifications must be valid JSON format.');
      setFormSaving(false);
      return;
    }

    const payload = {
      name: formName,
      description: formDesc,
      price: Number(formPrice),
      category: formCategory,
      stock: Number(formStock),
      image_url: formImage,
      specs: parsedSpecs
    };

    try {
      const url = modalType === 'add' ? '/api/products' : `/api/products/${selectedProductId}`;
      const method = modalType === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      // Refresh data
      await fetchProducts();
      await fetchStats();
      setShowProductModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this gadget from inventory?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Update local order list
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update order status.');
      }
    } catch (err) {
      console.error('Order status update error:', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'badge-success';
      case 'Shipped': return 'badge-info';
      case 'Processing': return 'badge-warning';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="admin-dashboard-page">
      <h2 className="section-heading" style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>

      {/* KPI Stats Grid */}
      {loadingStats ? (
        <div className="loader-container" style={{ minHeight: '120px' }}><div className="spinner"></div></div>
      ) : (
        <div className="stats-grid">
          {/* Revenue */}
          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${stats.metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="stat-icon-wrapper green-icon">
              <DollarSign size={24} />
            </div>
          </div>

          {/* Orders */}
          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.metrics.totalOrders}</span>
            </div>
            <div className="stat-icon-wrapper yellow-icon">
              <ShoppingBag size={24} />
            </div>
          </div>

          {/* Users */}
          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">{stats.metrics.totalUsers}</span>
            </div>
            <div className="stat-icon-wrapper purple-icon">
              <Users size={24} />
            </div>
          </div>

          {/* Products */}
          <div className="glass-card stat-card">
            <div className="stat-info">
              <span className="stat-label">Product count</span>
              <span className="stat-value">{stats.metrics.totalProducts}</span>
            </div>
            <div className="stat-icon-wrapper cyan-icon">
              <Cpu size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('products')}
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          Manage Inventory
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          Customer Orders
        </button>
      </div>

      {/* Product Management Section */}
      {activeTab === 'products' && (
        <div className="admin-content-section">
          <div className="glass-card">
            <div className="tab-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}><Cpu size={18} /> Gadget Catalog</h3>
              <button onClick={openAddModal} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <Plus size={16} /> Add New Gadget
              </button>
            </div>

            {loadingProducts ? (
              <div className="loader-container" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No products found. Click "Add New Gadget" to seed the catalog.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>{prod.name}</td>
                        <td>{prod.category}</td>
                        <td style={{ color: 'var(--primary-color)', fontWeight: 600 }}>${prod.price.toFixed(2)}</td>
                        <td>
                          {prod.stock > 0 ? (
                            <span className="badge badge-success">{prod.stock} units</span>
                          ) : (
                            <span className="badge badge-danger">Out of Stock</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => openEditModal(prod)}
                            className="action-icon-btn edit-btn"
                            title="Edit details"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="action-icon-btn delete-btn"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Management Section */}
      {activeTab === 'orders' && (
        <div className="admin-content-section">
          <div className="glass-card">
            <div className="tab-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}><FileText size={18} /> Customer Orders Management</h3>
            </div>

            {loadingOrders ? (
              <div className="loader-container" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Info</th>
                      <th>Placed Date</th>
                      <th>Order Details</th>
                      <th>Total Paid</th>
                      <th>Order Status</th>
                      <th style={{ textAlign: 'right' }}>Action Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>#GGLX-{ord.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ord.customer_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ord.customer_email}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.created_at).toLocaleString()}
                        </td>
                        <td>
                          <div className="order-items-thumbnail-list" style={{ marginBottom: '0.25rem' }}>
                            {ord.items?.map((item) => (
                              <img
                                key={item.id}
                                src={item.image_url}
                                alt={item.product_name}
                                title={`${item.product_name} x ${item.quantity}`}
                                className="order-item-thumbnail"
                              />
                            ))}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ord.items?.map(i => `${i.product_name} (x${i.quantity})`).join(', ')}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>${ord.total_amount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${getStatusClass(ord.status)}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <select
                            value={ord.status}
                            onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3 style={{ color: '#fff' }}>{modalType === 'add' ? 'Add New Gadget' : 'Edit Gadget Details'}</h3>
              <button onClick={() => setShowProductModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="auth-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Gadget Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Blade 16 Gaming Laptop"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Provide gadget details..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="form-input"
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 899.99"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/gadget.png"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Specs (JSON Format)</label>
                <textarea
                  placeholder='e.g. { "CPU": "Intel i7", "RAM": "16GB" }'
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  className="form-input"
                  rows="4"
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem' }}
                  disabled={formSaving}
                >
                  {formSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
