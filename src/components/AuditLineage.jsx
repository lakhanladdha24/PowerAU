import { useState } from 'react';
import { Database, ShieldAlert, Settings, FileText, ArrowRight, Activity, Terminal, GitBranch, GitCommit, RotateCcw, Plus } from 'lucide-react';

export default function AuditLineage({ 
  headers, 
  rows, 
  originalRows, 
  changesLog, 
  globalQualityScore, 
  datasetName,
  activeBranch = 'main',
  branchesList = ['main'],
  commitHistory = [],
  onCommit,
  onCreateBranch,
  onCheckoutBranch,
  onRollback
}) {
  const dupCount = changesLog.filter(c => c.type === 'Duplicate Row Removed').length;
  const healsCount = changesLog.length - dupCount;

  // Local state for version control inputs
  const [commitMsg, setCommitMsg] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateBranch, setShowCreateBranch] = useState(false);

  const handleCommitSubmit = (e) => {
    e.preventDefault();
    if (!commitMsg.trim()) return;
    onCommit(commitMsg.trim(), 'AI Analytics Architect');
    setCommitMsg('');
  };

  const handleCreateBranchSubmit = (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    try {
      onCreateBranch(newBranchName.trim());
      setNewBranchName('');
      setShowCreateBranch(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckout = (branch) => {
    try {
      onCheckoutBranch(branch);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRollbackClick = (commitId) => {
    if (window.confirm(`Are you sure you want to rollback to commit ${commitId}? This will overwrite your active branch data.`)) {
      try {
        onRollback(commitId);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 0. Git-for-Data Version Control Panel */}
      <div className="glass-panel glow-primary" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitBranch size={20} color="var(--primary)" />
              LakeFS Data Version Control (Git-for-Data)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Fork database states into isolated branches, commit quality snapshots, and rollback revisions instantly.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Branch:</span>
            <select 
              value={activeBranch}
              onChange={(e) => handleCheckout(e.target.value)}
              className="input-field"
              style={{ width: '150px', padding: '6px 12px', fontSize: '0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {branchesList.map(b => (
                <option key={b} value={b}>🌿 {b}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowCreateBranch(!showCreateBranch)}
              style={{ padding: '6px 12px', fontSize: '0.8rem', height: '34px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> <span>New Branch</span>
            </button>
          </div>
        </div>

        {/* Create Branch Form */}
        {showCreateBranch && (
          <form onSubmit={handleCreateBranchSubmit} className="fade-in" style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            <input 
              type="text" 
              placeholder="Enter new branch name (e.g. staging-clean)..."
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="input-field"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
              Fork Branch
            </button>
          </form>
        )}

        {/* Commit form & commits log */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {/* Left: Commit Current State */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GitCommit size={14} color="var(--accent-cyan)" />
              Commit Active State Snapshot
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Capture the current schema, self-healed rows, and audit logs as an immutable version snapshot.
            </p>
            <form onSubmit={handleCommitSubmit} style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <input 
                type="text" 
                placeholder="Commit message (e.g., Cleaned eCommerce telemetry)..."
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                className="input-field"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn btn-cyan" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Commit State
              </button>
            </form>
          </div>

          {/* Right: Commit History Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} color="var(--accent-purple)" />
              Branch Revision History
            </h4>
            <div className="revision-history-log" style={{ height: '110px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {commitHistory.length > 0 ? (
                commitHistory.map(commit => (
                  <div key={commit.id} className="revision-commit-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div className="commit-msg-text" style={{ color: '#fff', fontWeight: '700' }}>
                        {commit.message} <span style={{ color: 'var(--accent-cyan)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>({commit.id})</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                        Branch: <strong style={{ color: 'var(--accent-purple)' }}>{commit.branch}</strong> | {new Date(commit.timestamp).toLocaleTimeString()} by {commit.author}
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleRollbackClick(commit.id)}
                      style={{ padding: '2px 8px', fontSize: '0.65rem', height: '24px', borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
                    >
                      Rollback
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  No commits recorded on this branch.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Visual Node Lineage Flowchart */}
      <div className="glass-panel glow-cyan" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          Visual Data Lineage Flow
        </h3>
        
        {/* Node Tree Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '16px 8px' }}>
          
          {/* Node 1: Raw Ingest */}
          <div className="lineage-node">
            <div className="lineage-icon-box" style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}>
              <FileText size={20} />
            </div>
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>1. Raw Ingestion</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{datasetName || 'dataset.csv'}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{originalRows.length} rows imported</div>
            </div>
          </div>

          <ArrowRight size={24} color="var(--text-muted)" style={{ flexShrink: 0 }} />

          {/* Node 2: Schema Parse */}
          <div className="lineage-node">
            <div className="lineage-icon-box" style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}>
              <Database size={20} />
            </div>
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>2. Schema Inference</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Delimiter: Auto</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{headers.length} fields detected</div>
            </div>
          </div>

          <ArrowRight size={24} color="var(--text-muted)" style={{ flexShrink: 0 }} />

          {/* Node 3: Cleaning Engine */}
          <div className="lineage-node anim-pulse-cyan">
            <div className="lineage-icon-box" style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
              <ShieldAlert size={20} />
            </div>
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>3. Healing Pipeline</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>-{dupCount} duplicate rows</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>+{healsCount} repairs applied</div>
            </div>
          </div>

          <ArrowRight size={24} color="var(--text-muted)" style={{ flexShrink: 0 }} />

          {/* Node 4: Clean Output */}
          <div className="lineage-node">
            <div className="lineage-icon-box" style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}>
              <Settings size={20} />
            </div>
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>4. BI Ready Ingestion</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)' }}>Quality: {globalQualityScore}%</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{rows.length} rows structured</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Mod/Audit logs listing */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--primary)" />
              Lineage System Audit Logs
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Detailed audit trail of all AI automated healing repairs, format standardizations, and manual cells updates.
            </p>
          </div>
          <span className="badge badge-primary">{changesLog.length} Modifications</span>
        </div>

        <div className="data-table-container" style={{ maxHeight: '350px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Row Index</th>
                <th>Target Column</th>
                <th>Transformation Type</th>
                <th>Pre-Processed Value</th>
                <th>Cleaned (Output) Value</th>
                <th>AI Diagnostic Rationale</th>
              </tr>
            </thead>
            <tbody>
              {changesLog.length > 0 ? (
                changesLog.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                      {c.row === 'All' ? 'Global' : `#${c.row}`}
                    </td>
                    <td>
                      <span className="badge badge-primary">{c.column}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        c.type === 'Duplicate Row Removed' || c.type === 'Duplicate Merged & Removed' 
                          ? 'badge-rose' 
                          : c.type?.includes('Manual') 
                            ? 'badge-purple' 
                            : 'badge-emerald'
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-rose)' }}>
                      {c.oldValue === '' ? '[BLANK]' : String(c.oldValue)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                      {String(c.newValue)}
                    </td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'normal' }}>
                      {c.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No operations logged. Ingest a dataset to activate lineage auditing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
