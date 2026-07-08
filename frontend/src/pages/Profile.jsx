import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Edit, CheckCircle, Save, Key, AlertCircle, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import './Pages.css';

const Profile = () => {
  const { user, token, updateProfile } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Load user order logs
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(false);

    if (password && password !== confirmPassword) {
      setEditError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(name, email, password || undefined);
      setEditSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setEditError(err.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge badge-success">Delivered</span>;
      case 'Shipped':
        return <span className="badge badge-info">Shipped</span>;
      case 'Processing':
        return <span className="badge badge-warning">Processing</span>;
      case 'Cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="profile-page">
      <h2 className="section-heading" style={{ marginBottom: '2.5rem' }}>User Dashboard</h2>

      <div className="profile-layout">
        {/* Left Side: Sidebar Credentials & Edit Form */}
        <div className="profile-sidebar-wrapper">
          <div className="profile-sidebar glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="profile-avatar-container">
              <img src={user?.avatar} alt={user?.name} className="profile-avatar-large" />
            </div>
            
            <div>
              <h3 className="profile-username" style={{ fontWeight: 800 }}>{user?.name}</h3>
              <p className="profile-email">{user?.email}</p>
            </div>

            <span className="badge badge-info" style={{ letterSpacing: '0.05em', padding: '0.3rem 1rem' }}>
              {user?.role === 'admin' ? 'Administrator' : 'Customer Account'}
            </span>
          </div>

          {/* Profile Edit Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <Edit size={16} style={{ color: 'var(--primary-color)' }} /> Edit Profile Details
            </h3>

            {editError && (
              <div className="auth-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle size={16} />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Key size={12} /> New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              {password && (
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem' }}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Verify new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem' }}
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Orders Table */}
        <div className="orders-section">
          <div className="glass-card" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <ShoppingBag size={18} style={{ color: 'var(--primary-color)' }} /> Order History
            </h3>

            {loadingOrders ? (
              <div className="loader-container" style={{ minHeight: '150px' }}>
                <div className="spinner"></div>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                <ShoppingBag size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No orders placed yet. Start filling your cart with premium gadgets!</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Placed On</th>
                      <th>Purchased Items</th>
                      <th>Total Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const subtotal = order.total_amount * 0.92;
                      const tax = order.total_amount * 0.08;

                      return (
                        <React.Fragment key={order.id}>
                          <tr 
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                            className={isExpanded ? 'expanded-row-parent' : ''}
                          >
                            <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                #GGLX-{order.id}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {new Date(order.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td>
                              <div className="order-items-thumbnail-list">
                                {order.items?.map((item) => (
                                  <img
                                    key={item.id}
                                    src={item.image_url}
                                    alt={item.product_name}
                                    title={`${item.product_name} x ${item.quantity}`}
                                    className="order-item-thumbnail"
                                  />
                                ))}
                              </div>
                            </td>
                            <td style={{ fontWeight: 700 }}>${order.total_amount.toFixed(2)}</td>
                            <td>{getStatusBadge(order.status)}</td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan="5" style={{ padding: '0', background: 'rgba(7, 11, 19, 0.3)' }}>
                                <div className="invoice-container glass-card" style={{ margin: '1rem', border: '1px solid rgba(0, 242, 254, 0.1)', padding: '1.5rem', borderRadius: '8px' }}>
                                  
                                  {/* Invoice Header */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                    <div>
                                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
                                        <Receipt size={16} style={{ color: 'var(--primary-color)' }} />
                                        Invoice Details
                                      </h4>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transaction Reference: GGLX-TXN-{order.id}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Payment Method:</span>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700 }}>Galaxy Priority Wallet</div>
                                    </div>
                                  </div>

                                  {/* Itemized Invoice Table */}
                                  <div style={{ marginBottom: '1.5rem' }}>
                                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                          <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Product Name</th>
                                          <th style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>Unit Price</th>
                                          <th style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>Qty</th>
                                          <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.items?.map((item) => (
                                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '0.6rem 0', fontWeight: 500 }}>{item.product_name}</td>
                                            <td style={{ padding: '0.6rem 0', textAlign: 'center' }}>${item.price.toFixed(2)}</td>
                                            <td style={{ padding: '0.6rem 0', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
                                    {/* Left: Progress timeline and Shipping */}
                                    <div>
                                      <div style={{ fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Shipping Destination:</span>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                                          {user?.name}, Block-C, Tech Residency, Sector-5, India.
                                        </p>
                                      </div>
                                      
                                      {/* Visual Status Tracker Bar */}
                                      <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Delivery Tracking Status:</div>
                                        <div className="status-tracker-timeline">
                                          <div className={`timeline-step ${order.status !== 'Cancelled' ? 'active' : 'cancelled'}`}>
                                            <div className="step-circle">1</div>
                                            <span className="step-text">Ordered</span>
                                          </div>
                                          <div className={`timeline-line ${(order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered') ? 'active' : ''}`}></div>
                                          <div className={`timeline-step ${(order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered') ? 'active' : ''}`}>
                                            <div className="step-circle">2</div>
                                            <span className="step-text">Processing</span>
                                          </div>
                                          <div className={`timeline-line ${(order.status === 'Shipped' || order.status === 'Delivered') ? 'active' : ''}`}></div>
                                          <div className={`timeline-step ${(order.status === 'Shipped' || order.status === 'Delivered') ? 'active' : ''}`}>
                                            <div className="step-circle">3</div>
                                            <span className="step-text">Shipped</span>
                                          </div>
                                          <div className={`timeline-line ${order.status === 'Delivered' ? 'active' : ''}`}></div>
                                          <div className={`timeline-step ${order.status === 'Delivered' ? 'active' : ''}`}>
                                            <div className="step-circle">4</div>
                                            <span className="step-text">Delivered</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right: Invoice Pricing totals details */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(7, 11, 19, 0.4)', padding: '1rem', borderRadius: '6px', height: 'fit-content' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Estimated Tax (8%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Cyber-priority Shipping</span>
                                        <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>FREE</span>
                                      </div>
                                      <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.4rem 0', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                                        <span style={{ color: '#fff' }}>Grand Total</span>
                                        <span style={{ color: 'var(--primary-color)' }}>${order.total_amount.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
