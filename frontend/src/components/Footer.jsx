import React from 'react';
import { Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(7, 11, 19, 0.9)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '2.5rem 5% 1.5rem 5%',
      color: '#9CA3AF',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Brand */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.25rem',
            fontWeight: 800,
            marginBottom: '1rem'
          }}>
            <Cpu style={{ color: '#00F2FE' }} size={22} />
            <span>Gadget<span style={{ color: '#00F2FE' }}>Galaxy</span></span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '320px' }}>
            Next-gen tech e-commerce store created for college mini-project. Experience premium gadget shopping with modular controls.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '0.8rem', fontSize: '0.95rem' }}>Catalog</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li>Laptops</li>
              <li>Wearables</li>
              <li>Audio Devices</li>
              <li>Accessories</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '0.8rem', fontSize: '0.95rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li>User Panel</li>
              <li>Admin Dashboard</li>
              <li>SQLite DBMS</li>
              <li>Node/Express API</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem'
      }}>
        <span>&copy; {new Date().getFullYear()} GadgetGalaxy Inc. All Rights Reserved.</span>
        <span style={{ display: 'flex', gap: '1rem' }}>
          <span>Mini-Project Submission</span>
          <span>&bull;</span>
          <span style={{ color: '#00F2FE' }}>Verified Core Stack</span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
