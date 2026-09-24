import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowRight, ShieldCheck, Mail, Globe, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    universityName: '',
    domain: '',
    email: '',
    adminName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [generatedDid, setGeneratedDid] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/universities/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGeneratedDid(data.university.did);
        setStep(2);
      } else {
        alert(data.error || 'Failed to register university');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Network error. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} /> Back to Home
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="header">
                <div className="icon-wrapper">
                  <Building2 size={24} />
                </div>
                <h1>Issuer Registration</h1>
                <p>Register your university to start issuing Verifiable Credentials on the blockchain.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="universityName">University Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      id="universityName" 
                      name="universityName"
                      className="input-field" 
                      style={{ paddingInlineStart: '2.5rem' }}
                      placeholder="e.g. Stanford University"
                      required 
                      value={formData.universityName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="domain">Official Domain</label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      id="domain" 
                      name="domain"
                      className="input-field" 
                      style={{ paddingInlineStart: '2.5rem' }}
                      placeholder="e.g. stanford.edu"
                      required 
                      value={formData.domain}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Admin Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      className="input-field" 
                      style={{ paddingInlineStart: '2.5rem' }}
                      placeholder="admin@stanford.edu"
                      required 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="adminName">Admin Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      id="adminName" 
                      name="adminName"
                      className="input-field" 
                      style={{ paddingInlineStart: '2.5rem' }}
                      placeholder="John Doe"
                      required 
                      value={formData.adminName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="btn-primary" 
                  style={{ marginTop: '2rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{ width: 20, height: 20, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }}
                    />
                  ) : (
                    <>
                      Register Identity <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="icon-wrapper" 
                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.5rem' }}
              >
                <ShieldCheck size={32} />
              </motion.div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Identity Established!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Your Decentralized Identifier (DID) has been generated. You are now ready to issue cryptographically signed degree credentials.
              </p>
              
              <div style={{ background: 'var(--bg-page)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                {generatedDid || 'did:polygon:0x...'}
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary" 
              >
                Go to Dashboard
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
