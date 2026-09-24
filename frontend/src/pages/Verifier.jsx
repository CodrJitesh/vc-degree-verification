import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  Link2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Verifier() {
  const navigate = useNavigate();
  const [verifierName, setVerifierName] = useState('ABC Technologies');
  const [request, setRequest] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const createRequest = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/verifier/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifierName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create request');
      setRequest(data.request);
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!request?.requestId || request.status === 'verified') return undefined;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/verifier/requests/${request.requestId}/result`);
        const data = await res.json();
        if (res.ok && data.status === 'verified') {
          setResult(data);
          setRequest((prev) => (prev ? { ...prev, status: 'verified' } : prev));
        }
      } catch {
        /* ignore poll errors */
      }
    }, 2000);
    return () => clearInterval(id);
  }, [request]);

  const copyDeepLink = async () => {
    if (!request?.deepLink) return;
    await navigator.clipboard.writeText(request.deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <button type="button" className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Home
        </button>
        <div className="logo-section">
          <Shield size={22} className="logo-icon" />
          <span className="logo-text">VeriCred Verifier</span>
        </div>
        <div />
      </header>

      <main className="dashboard-grid">
        <motion.section
          className="glass-card dashboard-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header" style={{ marginBottom: '1.25rem' }}>
            <div className="icon-wrapper">
              <Sparkles size={22} />
            </div>
            <h1 style={{ fontSize: '1.35rem' }}>Create verification request</h1>
            <p style={{ fontSize: '0.9rem' }}>
              Ask the student to prove CGPA ≥ 8 without revealing the exact CGPA — as set by
              Almighty Jitesh.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="verifierName">Company / verifier name</label>
            <input
              id="verifierName"
              className="input-field"
              value={verifierName}
              onChange={(e) => setVerifierName(e.target.value)}
            />
          </div>

          <ul className="policy-list">
            <li>Degree = B.Tech</li>
            <li>Branch = Computer Science</li>
            <li>Graduation year ≤ 2027</li>
            <li>CGPA ≥ 8 (private)</li>
          </ul>

          {error && <p className="form-error">{error}</p>}

          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={busy}
            onClick={createRequest}
          >
            {busy ? 'Creating…' : 'Create request'}
          </button>
        </motion.section>

        <section className="dashboard-side">
          {request && (
            <div className="glass-card dashboard-panel">
              <h2 className="panel-title">Request {request.requestId}</h2>
              <p className="muted">Status: {request.status}</p>
              <div className="did-chip">{request.deepLink}</div>
              <div className="action-row">
                <button type="button" className="btn-secondary" onClick={copyDeepLink}>
                  <ClipboardCopy size={16} /> {copied ? 'Copied' : 'Copy deep link'}
                </button>
                <a className="btn-secondary" href={request.deepLink}>
                  <Link2 size={16} /> Open scheme
                </a>
              </div>
              <p className="muted" style={{ marginTop: '1rem' }}>
                On Android: open the deep link, or use Demo request / Import then Approve. This
                page polls for VERIFIED.
              </p>
            </div>
          )}

          {result?.result && (
            <motion.div
              className="glass-card dashboard-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="issued-banner">
                <CheckCircle2 size={20} />
                <span>VERIFIED</span>
              </div>
              <pre className="json-preview">{JSON.stringify(result.result, null, 2)}</pre>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}
