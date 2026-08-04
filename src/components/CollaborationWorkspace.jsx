import { useState } from 'react';
import { Users, Share2, MessageSquare, Send, Bell, Check, Copy } from 'lucide-react';

export default function CollaborationWorkspace({ datasetName }) {
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([
    {
      user: 'Sarah Smith',
      role: 'Lead Business Analyst',
      text: "The auto-healing normalizations fixed the malformed emails. Ready to push this schema to the warehouse.",
      target: 'Tuition Receipts',
      time: '10 mins ago'
    },
    {
      user: 'Alex Rivera',
      role: 'VP Operations',
      text: "Can we run a forecast sweep comparing average fees against last month? Need it for the slide deck.",
      target: 'Tuition Receipts',
      time: '2 hours ago'
    },
    {
      user: 'Anita West',
      role: 'Data Engineer',
      text: "Cleaned files are compatible with Lookout/Tableau connectors. I did a test import.",
      target: 'BI Ready Export',
      time: '1 day ago'
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [commentTarget, setCommentTarget] = useState('General Dashboard');

  const [activeUsers] = useState([
    { name: 'Sarah Smith', role: 'Analyst', status: 'Viewing Smart Dashboard', avatar: 'SS', color: 'var(--accent-cyan)' },
    { name: 'Alex Rivera', role: 'VP Operations', status: 'Querying Copilot', avatar: 'AR', color: 'var(--accent-purple)' },
    { name: 'Anita West', role: 'Data Engineer', status: 'Idle (Workspace Admin)', avatar: 'AW', color: 'var(--accent-emerald)' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Sarah Smith approved the data lineage schema audit.", time: "5 mins ago", read: false },
    { id: 2, text: "Auto-Healing pipeline corrected 15 email formatting typos.", time: "1 hour ago", read: true }
  ]);

  const handlePostComment = (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;

    setComments(prev => [
      {
        user: 'You (Owner)',
        role: 'Workspace Administrator',
        text: newComment.trim(),
        target: commentTarget,
        time: 'Just now'
      },
      ...prev
    ]);
    setNewComment('');

    // Simulate Sarah replying
    setTimeout(() => {
      setComments(prev => [
        ...prev,
        {
          user: 'Sarah Smith',
          role: 'Lead Business Analyst',
          text: "Acknowledged! I am reviewing the comments you just posted on the dashboard thread.",
          target: commentTarget,
          time: '1 min ago'
        }
      ]);
      setNotifications(notifs => [
        { id: Date.now(), text: `Sarah Smith replied to your thread in ${commentTarget}.`, time: "Just now", read: false },
        ...notifs
      ]);
    }, 1200);
  };

  const generateShareLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(`https://dataforge.ai/share/workspace_${Math.round(Math.random() * 89999 + 10000)}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="dashboard-grid fade-in">
      
      {/* 1. Collaboration comments feed */}
      <div className="dashboard-card-lg glass-panel glow-primary" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          Workspace Collaboration Hub
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Discuss transformations, audit logs, and analytics insights for {datasetName || 'the active dataset'} directly with your project stakeholders.
        </p>

        {/* Comment input form */}
        <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reference Topic:</span>
            <select 
              value={commentTarget} 
              onChange={(e) => setCommentTarget(e.target.value)}
              className="input-field"
              style={{ width: '180px', padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bg-surface-elevated)' }}
            >
              <option value="General Dashboard">General Dashboard</option>
              <option value="Tuition Receipts">Tuition Receipts</option>
              <option value="Data Lineage Graph">Data Lineage Graph</option>
              <option value="BI Ready Export">BI Ready Export</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Drop a comment or request revision..." 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.8rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '6px', padding: '10px 16px' }}>
              <Send size={14} /> Send
            </button>
          </div>
        </form>

        {/* Comments Feed List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
          {comments.map((comment, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', color: '#fff' }}>
                {comment.user.split(' ').map(n=>n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="comment-username" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>{comment.user}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{comment.role}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{comment.time}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {comment.text}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.55rem', padding: '1px 6px' }}>
                    #{comment.target}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Side Panels (Active users & Share workspace) */}
      <div className="dashboard-card-sm style-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Active team members */}
        <div className="glass-panel glow-cyan" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="var(--accent-cyan)" />
            Collaborators Online
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeUsers.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#fff' }}>
                    {u.avatar}
                  </div>
                  <div>
                    <div className="user-list-name" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>{u.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.status}</div>
                  </div>
                </div>
                <div className="bullet-active" style={{ background: 'var(--accent-emerald)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Shared link */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Share2 size={16} color="var(--accent-purple)" />
            Share Dashboard
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Publish this self-healing dashboard online. Stakeholders can inspect anomalies, charts, and forecasts.
          </p>
          <button 
            onClick={generateShareLink} 
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', gap: '8px', fontSize: '0.75rem', padding: '8px 12px', border: '1px solid var(--accent-purple)', background: 'rgba(168,85,247,0.02)' }}
          >
            {copied ? (
              <>
                <Check size={14} color="var(--accent-emerald)" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} color="var(--accent-purple)" />
                <span>Copy Shareable Link</span>
              </>
            )}
          </button>
        </div>

        {/* Collaborative notifications log */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} color="var(--accent-amber)" />
              Notifications
            </h3>
            {notifications.some(n=>!n.read) && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.65rem', cursor: 'pointer' }}>
                Mark read
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map(n => (
              <div key={n.id} style={{ display: 'flex', gap: '6px', background: n.read ? 'transparent' : 'rgba(245,158,11,0.03)', border: n.read ? 'none' : '1px solid rgba(245,158,11,0.1)', padding: '6px', borderRadius: '4px' }}>
                {!n.read && <div className="bullet-active" style={{ background: 'var(--accent-amber)', marginTop: '4px', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{n.text}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
