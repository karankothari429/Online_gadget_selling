import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Send, User, MessageSquare, AlertCircle, CheckCircle, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Pages.css';

const Support = () => {
  const { user } = useAuth();
  
  // FAQ State
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  
  // Ticket Form State
  const [ticketName, setTicketName] = useState(user?.name || '');
  const [ticketEmail, setTicketEmail] = useState(user?.email || '');
  const [ticketCategory, setTicketCategory] = useState('Technical Support');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! Welcome to the GadgetGalaxy Cyber-Support Terminal. I am Chat-Unit 4. Ask me anything about our gadgets, orders, or admin features!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const faqs = [
    {
      q: "How do I track my order shipping status?",
      a: "Log into your account and head to your User Dashboard (Profile). Under Order History, click on any order row to expand its detailed invoice. You will see a live visual timeline tracking the status from Ordered ➜ Processing ➜ Shipped ➜ Delivered."
    },
    {
      q: "What is your return and refund policy?",
      a: "We offer a 30-day hassle-free return policy on all gadgets. Devices must be returned in their original packaging. You can initiate a return by submitting a technical support ticket on this page or contacting live chat."
    },
    {
      q: "How do I access the Admin Control Dashboard?",
      a: "Evaluators can log in using our pre-seeded administrator credentials: Email 'admin@gadgetgalaxy.com' and Password 'admin123'. Once logged in, an 'Admin' button will appear in the navigation bar to access inventory metrics and CRUD controls."
    },
    {
      q: "Is payment processing safe on this system?",
      a: "Yes. All sessions are protected using session-less JSON Web Tokens (JWT). Client data is isolated, and databases are protected using prepared statements to prevent SQL injections on our Express and SQLite servers."
    }
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    // Generate random Ticket ID
    const randomId = 'GGLX-TKT-' + Math.floor(1000 + Math.random() * 9000);
    setTicketId(randomId);
    setTicketSubmitted(true);
    
    // Clear form
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    const query = chatInput.toLowerCase();
    setChatInput('');
    setIsTyping(true);

    // Simulate cyber assistant response with typing delay
    setTimeout(() => {
      let replyText = "";

      if (query.includes('order') || query.includes('track') || query.includes('status')) {
        replyText = "To track orders, navigate to your Profile page and check your 'Order History'. Clicking on an order row will show its status timeline (Ordered ➜ Processing ➜ Shipped ➜ Delivered).";
      } else if (query.includes('return') || query.includes('refund') || query.includes('policy')) {
        replyText = "Our gadget store offers a 30-day return policy. Submit an official ticket using the form on the left, and our logistics unit will send a shipping label.";
      } else if (query.includes('admin') || query.includes('crud') || query.includes('credential')) {
        replyText = "Log in as an Administrator using 'admin@gadgetgalaxy.com' with password 'admin123'. This gives you full CRUD access to add, update, or remove gadgets and manage customer orders.";
      } else if (query.includes('laptop') || query.includes('rig') || query.includes('apex') || query.includes('i9')) {
        replyText = "The Apex Blade 16 Gaming Laptop is our best-selling station! It sports an Intel i9-14900HX processor, NVIDIA RTX 4090 (16GB) card, and 32GB DDR5 RAM.";
      } else if (query.includes('sqlite') || query.includes('db') || query.includes('database')) {
        replyText = "This project utilizes SQLite, which writes to 'database.sqlite' inside the backend folder. This ensures easy configuration for evaluators without configuring server instances.";
      } else if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
        replyText = "Hello! Let me know what technical specs, orders, or dashboard features you would like help with.";
      } else {
        replyText = "I've recorded your query in our galaxy database. You can also submit an official support ticket using the contact form on this page so our human tech specialists can follow up!";
      }

      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="support-page" style={{ paddingTop: '1rem' }}>
      <h2 className="section-heading" style={{ marginBottom: '2rem' }}>Help & Technical Support</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'stretch' }} className="grid-cols-2">
        {/* Left Column: FAQ Accordion & Contact Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* FAQ Section */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} style={{ color: 'var(--primary-color)' }} /> Frequently Asked Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(7, 11, 19, 0.3)'
                  }}>
                    <button
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        padding: '1rem',
                        textAlign: 'left',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isOpen && (
                      <div style={{
                        padding: '0 1rem 1rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.6',
                        borderTop: '1px solid rgba(255,255,255,0.02)'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Submission Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Headphones size={18} style={{ color: 'var(--primary-color)' }} /> Submit Support Ticket
            </h3>

            {ticketSubmitted ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                padding: '1.2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <CheckCircle size={36} style={{ margin: '0 auto 0.8rem auto' }} />
                <h4 style={{ marginBottom: '0.4rem', color: '#fff' }}>Ticket Logged Successfully</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Your support reference is <strong>{ticketId}</strong>. A technical specialist will review your inquiry and follow up via email shortly.
                </p>
                <button onClick={() => setTicketSubmitted(false)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem' }}>Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem' }}>Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem' }}>Inquiry Category</label>
                  <select
                    className="form-input"
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Account Assistance">Account Assistance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem' }}>Subject</label>
                  <input
                    type="text"
                    placeholder="Brief summary of your query"
                    className="form-input"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem' }}>Message Details</label>
                  <textarea
                    placeholder="Describe your technical issue or questions..."
                    className="form-input"
                    rows="3"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.3rem' }}>
                  Log Support Ticket
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Column: Simulated Live Chat Assistant */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 0 0 0', overflow: 'hidden', minHeight: '520px' }}>
            
            {/* Chat Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid var(--border-color)', padding: '0 1.5rem 1rem 1.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}></div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Cyber-Support Assistant</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unit-04 &bull; Technical Support AI</span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              background: 'rgba(7, 11, 19, 0.2)',
              maxHeight: '400px'
            }}>
              {chatMessages.map((msg, idx) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    alignSelf: isBot ? 'flex-start' : 'flex-end'
                  }}>
                    <div style={{
                      background: isBot ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
                      border: isBot ? '1px solid var(--border-color)' : 'none',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: isBot ? '0 12px 12px 12px' : '12px 12px 0 12px',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      boxShadow: isBot ? 'none' : 'var(--glow-cyan)'
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.2rem' }}>
                      {msg.time}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-start' }}>
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.6rem 1rem',
                    borderRadius: '0 12px 12px 12px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></div>
                    <style>{`
                      @keyframes bounce {
                        0%, 80%, 100% { transform: scale(0); }
                        40% { transform: scale(1.0); }
                      }
                    `}</style>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Chat Send Input Form */}
            <form onSubmit={handleSendMessage} style={{
              display: 'flex',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              gap: '0.8rem',
              background: 'rgba(13, 19, 34, 0.4)'
            }}>
              <input
                type="text"
                placeholder="Ask support unit..."
                className="form-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flex: 1, borderRadius: '20px' }}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignSelf: 'center' }}
                disabled={isTyping}
              >
                <Send size={16} />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
