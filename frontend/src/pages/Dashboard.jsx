import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Download,
  GraduationCap,
  Plus,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SESSION_KEY = 'vericred_university';

const emptyForm = {
  studentName: 'Jitesh Singh',
  studentDid: 'did:polygon:student-jitesh-demo',
  degree: 'B.Tech',
  branch: 'Computer Science',
  graduationYear: '2027',
  cgpa: '9.1',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [university, setUniversity] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [issuing, setIssuing] = useState(false);
  const [lastIssued, setLastIssued] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const universityId =
    searchParams.get('universityId') ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')?.id;
      } catch {
        return null;
      }
    })();

  const loadCredentials = useCallback(async (id) => {
    const res = await fetch(`/api/issuer/credentials?universityId=${id}`);
    const data = await res.json();
    if (res.ok) setCredentials(data.credentials || []);
  }, []);

  useEffect(() => {
    if (!universityId) {
      setError('No university session. Register first.');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/universities/${universityId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'University not found. Re-register — in-memory DB resets on server restart.');
          return;
        }
        setUniversity(data.university);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.university));
        await loadCredentials(universityId);
      } catch {
        setError('Cannot reach backend. Is it running on port 3000?');
      }
    })();
  }, [universityId, loadCredentials]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!universityId) return;
    setIssuing(true);
    setError('');
    setLastIssued(null);
    setCopied(false);

    try {
      const res = await fetch('/api/issuer/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId,
          ...form,
          graduationYear: Number(form.graduationYear),
          cgpa: Number(form.cgpa),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Issue failed');
        return;
      }
      setLastIssued(data.credential);
      await loadCredentials(universityId);
    } catch {
      setError('Network error while issuing credential.');
    } finally {
      setIssuing(false);
    }
  };

  const copyJson = async () => {
    if (!lastIssued) return;
    await navigator.clipboard.writeText(JSON.stringify(lastIssued, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!lastIssued) return;
    const blob = new Blob([JSON.stringify(lastIssued, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lastIssued.credentialId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <button type="button" className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Home
        </button>
        <div className="logo-section">
          <Shield size={22} className="logo-icon" />
          <span className="logo-text">VeriCred Issuer</span>
        </div>
        <div />
      </header>

      {error && !university && (
        <div className="dashboard-empty">
          <p>{error}</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/onboarding')}>
            Register University
          </button>
        </div>
      )}

      {university && (
        <main className="dashboard-grid">
          <motion.section
            className="glass-card dashboard-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="header" style={{ marginBottom: '1.25rem' }}>
              <div className="icon-wrapper">
                <GraduationCap size={22} />
              </div>
              <h1 style={{ fontSize: '1.35rem' }}>{university.universityName}</h1>
              <p style={{ fontSize: '0.9rem' }}>Issue a signed degree credential to a student wallet.</p>
            </div>

            <div className="did-chip" title={university.did}>
              {university.did}
            </div>

            <form onSubmit={handleIssue} className="issue-form">
              <div className="form-group">
                <label htmlFor="studentName">Student name</label>
                <input
                  id="studentName"
                  name="studentName"
                  className="input-field"
                  value={form.studentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="studentDid">Student DID</label>
                <input
                  id="studentDid"
                  name="studentDid"
                  className="input-field"
                  value={form.studentDid}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="degree">Degree</label>
                  <input
                    id="degree"
                    name="degree"
                    className="input-field"
                    value={form.degree}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="branch">Branch</label>
                  <input
                    id="branch"
                    name="branch"
                    className="input-field"
                    value={form.branch}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="graduationYear">Graduation year</label>
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    className="input-field"
                    value={form.graduationYear}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cgpa">CGPA</label>
                  <input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="input-field"
                    value={form.cgpa}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn-primary" disabled={issuing} style={{ marginTop: '1rem' }}>
                {issuing ? (
                  'Signing…'
                ) : (
                  <>
                    <Plus size={18} /> Issue credential
                  </>
                )}
              </button>
            </form>
          </motion.section>

          <section className="dashboard-side">
            {lastIssued && (
              <motion.div
                className="glass-card dashboard-panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="issued-banner">
                  <CheckCircle2 size={20} />
                  <span>Issued — copy JSON into Android wallet assets / import</span>
                </div>
                <pre className="json-preview">{JSON.stringify(lastIssued, null, 2)}</pre>
                <div className="action-row">
                  <button type="button" className="btn-secondary" onClick={copyJson}>
                    <Copy size={16} /> {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={downloadJson}>
                    <Download size={16} /> Download
                  </button>
                </div>
              </motion.div>
            )}

            <div className="glass-card dashboard-panel">
              <h2 className="panel-title">Issued credentials ({credentials.length})</h2>
              {credentials.length === 0 ? (
                <p className="muted">No credentials yet. Issue the first degree above.</p>
              ) : (
                <ul className="cred-list">
                  {credentials.map((c) => (
                    <li key={c.credentialId}>
                      <strong>
                        {c.claims.degree} {c.claims.branch}
                      </strong>
                      <span>
                        {c.claims.name} · CGPA {c.claims.cgpa} · {c.credentialId}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
