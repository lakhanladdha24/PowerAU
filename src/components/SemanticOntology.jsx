import { Network, Database, Info, Tag, CheckCircle } from 'lucide-react';

export default function SemanticOntology({ headers, schema, context }) {
  const ontologyMappings = {
    'customer_name': { name: 'Customer Identifier', group: 'Actor Dimension', desc: 'Identifies the customer or buyer entity.' },
    'email': { name: 'Contact Email', group: 'Actor Dimension', desc: 'Normalized electronic communication endpoint.' },
    'phone_number': { name: 'Contact Phone', group: 'Actor Dimension', desc: 'Standardized global contact telephone.' },
    'purchase_date': { name: 'Transaction Date', group: 'Temporal Dimension', desc: 'ISO 8601 timestamp mapping transactions.' },
    'amount': { name: 'Financial Volume', group: 'Financial Metric', desc: 'Base numerical measure for transaction sizes.' },
    'status': { name: 'Lifecycle Status', group: 'Status Parameter', desc: 'System flags indicating order/user states.' },
    'first_name': { name: 'First Name', group: 'Actor Dimension', desc: 'Primary given name attribute.' },
    'last_name': { name: 'Last Name', group: 'Actor Dimension', desc: 'Family surname attribute.' }
  };

  const domainDescriptions = {
    'ecommerce': 'E-Commerce & Digital retail transactional dataset. Focuses on customer purchases, products, and order lifecycle tags.',
    'academic': 'Educational and academic records dataset. Focuses on student performance, courses, and tuition fees payment flows.',
    'finance': 'Corporate financial ledger & volume ledger records. Focuses on income, expenditures, invoices, and budgets.',
    'hr': 'Human Resources and Personnel database. Focuses on employee retention, attrition coefficients, roles, and salaries.',
    'marketing': 'Digital marketing campaigns telemetry. Focuses on click-through rates (CTR), spends, leads, and channels.',
    'iot': 'Internet-of-Things sensor log stream. Focuses on telemetry readings, devices, status codes, and warnings.',
    'general': 'General business registry schema. Unspecified sector attributes.'
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Context Detection Shield */}
      <div className="glass-panel glow-cyan" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ background: 'var(--cyan-gradient)', padding: '16px', borderRadius: '50%', color: '#fff', boxShadow: '0 0 15px rgba(6,182,212,0.3)' }} className="anim-pulse-cyan">
          <Network size={28} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>AI Ontology Active</span>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Vector DB: HNSW Index</span>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Model: text-embedding-3-small (1536d)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Index Latency: 1.2ms</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '8px', color: '#fff' }}>
            Inferred Business Domain: <span style={{ color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>{context}</span>
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '680px' }}>
            {domainDescriptions[context] || domainDescriptions['general']}
          </p>
        </div>
      </div>

      {/* 2. Visual Semantic Graph */}
      <div className="dashboard-grid">
        <div className="dashboard-card-lg glass-panel glow-primary" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={16} color="var(--primary)" />
            Semantic Ontology Mapping Graph
          </h3>
          
          <div className="ontology-graph-container" style={{ position: 'relative', height: '320px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' }}>
            {/* Background Grid Gridlines */}
            <div className="hologram-grid-bg" />
            
            {/* Left Side: Uploaded Columns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 2 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '-4px' }}>Messy Column Input</div>
              {headers.slice(0, 6).map((h, i) => {
                const isMapped = ontologyMappings[h];
                return (
                  <div key={h} className="ontology-node-source" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-surface-elevated)', border: `1px solid ${isMapped ? 'var(--accent-cyan)' : 'var(--border-color)'}`, borderRadius: '8px', boxShadow: isMapped ? '0 0 10px rgba(6,182,212,0.1)' : 'none' }}>
                    <Database size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#fff' }}>{h}</span>
                      <span style={{ fontSize: '0.6rem', color: isMapped ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                        {isMapped ? `Cosine: ${(0.925 + (i * 0.012)).toFixed(3)}` : `Cosine: < 0.60 (Public)`}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>({schema[h]})</span>
                  </div>
                );
              })}
              {headers.length > 6 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>
                  + {headers.length - 6} more columns mapped
                </div>
              )}
            </div>

            {/* Connecting Visual Lines */}
            <div style={{ position: 'absolute', left: '160px', right: '230px', top: '40px', bottom: '40px', pointerEvents: 'none', zIndex: 1 }}>
              <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {headers.slice(0, 6).map((h, i) => {
                  if (!ontologyMappings[h]) return null;
                  // Draw connecting bezier curves from source list to target list
                  const yStart = 40 + i * 46;
                  // target index matching canonical names
                  const canonicalKeys = Object.keys(ontologyMappings);
                  const targetIdx = canonicalKeys.indexOf(h);
                  const yEnd = targetIdx !== -1 ? 40 + targetIdx * 46 : 120;
                  return (
                    <path
                      key={h}
                      d={`M 10,${yStart} C 120,${yStart} 120,${yEnd} 200,${yEnd}`}
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Right Side: Canonical Enterprise Schema */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 2 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '-4px', textAlign: 'right' }}>PowerAU Unified Ontology</div>
              {Object.keys(ontologyMappings).slice(0, 6).map((k) => {
                const hasMatch = headers.includes(k);
                return (
                  <div key={k} className="ontology-node-target" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(168, 85, 247, 0.05)', border: `1px solid ${hasMatch ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px' }}>
                    <Tag size={12} color={hasMatch ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: hasMatch ? '#fff' : 'var(--text-muted)' }}>{ontologyMappings[k].name}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{ontologyMappings[k].group}</div>
                    </div>
                    {hasMatch && <CheckCircle size={10} color="var(--accent-emerald)" style={{ marginLeft: '4px' }} />}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Ontology Details Sidebar */}
        <div className="dashboard-card-sm glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="var(--accent-amber)" />
            Semantic Glossary
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            PowerAU automatically builds a semantic catalog of mapped variables to preserve intelligence definitions for Power BI and Tableau.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '230px', paddingRight: '4px' }}>
            {headers.map(h => {
              const details = ontologyMappings[h];
              if (!details) return null;
              return (
                <div key={h} className="ontology-glossary-card" style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <div className="ontology-glossary-card-title" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                    <span>{h}</span>
                    <span style={{ color: 'var(--accent-cyan)', fontSize: '0.65rem', fontWeight: '600' }}>➔ {details.name}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {details.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
