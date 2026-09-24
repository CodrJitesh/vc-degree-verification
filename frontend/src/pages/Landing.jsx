import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, Lock, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo-section">
          <Shield className="logo-icon" size={28} />
          <span className="logo-text">VeriCred</span>
        </div>
        <div className="nav-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/verifier')}
          >
            Verifier Login
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const saved = localStorage.getItem('vericred_university');
              if (saved) {
                const u = JSON.parse(saved);
                navigate(`/dashboard?universityId=${u.id}`);
              } else {
                navigate('/onboarding');
              }
            }}
          >
            Issuer Dashboard
          </button>
        </div>
      </nav>

      <main className="hero-section">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-content"
        >
          <div className="badge">
            <CheckCircle2 size={16} />
            <span>W3C Verifiable Credentials Standard</span>
          </div>
          
          <h1 className="hero-title">
            The Future of <span className="gradient-text">Degree Verification</span>
          </h1>
          
          <p className="hero-subtitle">
            Issue cryptographically secure, privacy-preserving degrees. Empower your students and streamline hiring with zero-knowledge proof verification.
          </p>

          <div className="hero-cta-group">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary btn-large"
              onClick={() => navigate('/onboarding')}
            >
              <GraduationCap size={20} />
              Register University
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </main>

      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose VeriCred?</h2>
          <p>The new standard for academic credential verification.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={24} /></div>
            <h3>Decentralized Trust</h3>
            <p>No central database. Universities sign credentials with their own Decentralized Identifiers (DIDs).</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Lock size={24} /></div>
            <h3>Zero-Knowledge Proofs</h3>
            <p>Students prove they meet requirements (like CGPA &gt; 8) without revealing their exact grades.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={24} /></div>
            <h3>Instant Verification</h3>
            <p>Hiring platforms get cryptographically guaranteed proof instantly, eliminating manual background checks.</p>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          <div className="faq-item">
            <h4>What is a Verifiable Credential?</h4>
            <p>It is a tamper-evident digital credential whose authorship can be cryptographically verified, following W3C standards.</p>
          </div>
          <div className="faq-item">
            <h4>How does privacy work?</h4>
            <p>The student's wallet stores the credential. When an employer asks for data, the student must explicitly consent. Zero-knowledge proofs ensure only necessary conditions are proven.</p>
          </div>
          <div className="faq-item">
            <h4>Do universities need to buy crypto?</h4>
            <p>No. VeriCred handles the complex blockchain interactions. Universities just verify their identity and click issue.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Shield size={20} className="logo-icon" />
            <span className="logo-text">VeriCred</span>
          </div>
          <p className="footer-text">Built for the 20-Hour Hackathon • Decentralized Identity Portal</p>
        </div>
      </footer>
    </div>
  );
}
