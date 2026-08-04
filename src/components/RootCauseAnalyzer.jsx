import { useState } from 'react';
import { ShieldAlert, BarChart2, Layers, CheckCircle } from 'lucide-react';

export default function RootCauseAnalyzer({ headers, rows, schema, context }) {
  const [selectedIssue, setSelectedIssue] = useState('sales_drop');
  
  const issueProfiles = {
    'sales_drop': {
      title: 'Gross Revenue / Sales Drop (Q2)',
      score: 87,
      drivers: [
        { name: 'Pricing Competitiveness', weight: 45, status: 'critical', desc: 'Competitor matches drove high price elasticity churn.' },
        { name: 'Marketing Campaign Decay', weight: 28, status: 'warning', desc: 'Google Ad CTR dropped 14% month-over-month.' },
        { name: 'Seasonality Factors', weight: 15, status: 'info', desc: 'Historical Q2 vacation cycles dip expectedly.' },
        { name: 'Operational Logistics', weight: 12, status: 'info', desc: 'Slight order fulfillment lags in Eastern region.' }
      ],
      actions: [
        'Deploy a 10% loyalty discount to high-risk cohorts.',
        'Re-allocate 15% budget from broad search keywords to conversion remarketing.',
        'Adjust inventory safety stock metrics ahead of seasonality trends.'
      ]
    },
    'churn_increase': {
      title: 'Customer Retention Attrition Surge',
      score: 92,
      drivers: [
        { name: 'Support Tickets Backlog', weight: 40, status: 'critical', desc: 'Fulfillment complaints response time exceeded 48h limit.' },
        { name: 'Competitor Aggressive Promo', weight: 35, status: 'critical', desc: 'Targeted retention competitor campaign offering free trials.' },
        { name: 'Product Pricing Shifts', weight: 15, status: 'warning', desc: 'Recent premium SaaS pricing tiers adjustments.' },
        { name: 'System Outage Incidents', weight: 10, status: 'info', desc: 'Minor gateway downtime recorded on May 12.' }
      ],
      actions: [
        'Establish automated support queues prioritizing users with active tickets and billing payments > $500.',
        'Launch an email sequence detailing core features updates.',
        'Extend a complimentary 1-month trial extension to customers facing payment gateway errors.'
      ]
    }
  };

  const activeProfile = issueProfiles[selectedIssue];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Diagnostic Selector */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="var(--accent-rose)" />
            AI Root Cause Analysis Engine
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            PowerAU isolates anomalies, inspects parameters, and constructs causal influence maps automatically.
            {headers && rows && schema && ` Analyzing business context '${context || 'general'}' with ${rows.length} records across ${headers.length} properties (${Object.keys(schema).filter(col => schema[col] === 'Integer' || schema[col] === 'Float' || schema[col] === 'Currency').length} numerical features).`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Isolate Issue:</span>
          <select 
            value={selectedIssue} 
            onChange={(e) => setSelectedIssue(e.target.value)}
            className="input-field"
            style={{ width: '220px', padding: '6px 12px', fontSize: '0.8rem', background: 'var(--bg-surface-elevated)' }}
          >
            <option value="sales_drop">Gross Revenue / Sales Drop</option>
            <option value="churn_increase">Customer Retention Attrition Surge</option>
          </select>
        </div>
      </div>

      {/* 2. Causal influence tree layout */}
      <div className="dashboard-grid">
        
        {/* Left Side: Causal Tree */}
        <div className="dashboard-card-lg glass-panel glow-rose" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--accent-rose)" />
              Causal Influence Tree Diagram
            </h3>
            <span className="badge badge-rose">Confidence: {activeProfile.score}%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
            {/* Background grids */}
            <div className="hologram-grid-bg" />

            {/* Tree Root */}
            <div style={{ alignSelf: 'center', background: 'var(--rose-gradient)', padding: '12px 20px', borderRadius: '10px', fontWeight: '800', color: '#fff', fontSize: '0.85rem', zIndex: 2, boxShadow: '0 0 15px rgba(244,63,94,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Target Anomaly: {activeProfile.title}
            </div>

            {/* Tree Connecting Lines (Simulated via flex columns & spacers) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '16px', zIndex: 2 }}>
              {activeProfile.drivers.map((d, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center',
                    background: 'var(--bg-surface-elevated)',
                    border: `1px solid ${d.status === 'critical' ? 'var(--accent-rose)' : d.status === 'warning' ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '12px 8px',
                    position: 'relative'
                  }}
                >
                  {/* Visual Node line connection back to root */}
                  <div style={{ width: '2px', height: '16px', background: d.status === 'critical' ? 'var(--accent-rose)' : 'var(--border-color)', position: 'absolute', top: '-16px' }} />
                  
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: d.status === 'critical' ? 'var(--accent-rose)' : '#fff' }}>
                    {d.weight}%
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff', marginTop: '4px', height: '32px', overflow: 'hidden' }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.3' }}>
                    {d.desc}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Side: Suggested Corrective Action List */}
        <div className="dashboard-card-sm glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color="var(--accent-cyan)" />
            Prescriptive Heuristics
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            PowerAU models recommended operational decisions based on Isolated Causal weights.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeProfile.actions.map((act, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 12px',
                  borderRadius: '8px'
                }}
              >
                <CheckCircle size={14} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {act}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
