import { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, Circle, Play, AlertCircle, FileSpreadsheet, Activity, Key, Trash2 } from 'lucide-react';

export default function AiPreProcessorChamber({
  fileName,
  originalData,
  cleanedData,
  transformationLog,
  qualityScore,
  completeness,
  schema,
  emptyCount,
  healsCount,
  anomaliesCount,
  onSendToAnalytics,
  onReset
}) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPipelineComplete, setIsPipelineComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const stages = [
    { title: "Upload Complete", desc: "File buffers parsed into processing block" },
    { title: "Detecting File Type", desc: "Mapping layout metadata and encoding markers" },
    { title: "Understanding Data", desc: "Inferring context domain, shape structures, and fields" },
    { title: "Extracting Information", desc: "Reconstructing logs, tables, forms, or OCR layers" },
    { title: "Cleaning Data", desc: "Standardizing dates, formatting currencies, healing typos" },
    { title: "Structuring Rows & Columns", desc: "Purging empty/duplicate rows and mapping dimensions" },
    { title: "Validating Dataset", desc: "Scanning for outliers, checking constraints, evaluating health" },
    { title: "Sending to Analytics", desc: "Packaging target schema for PowerAU BI modules" },
    { title: "Dashboard Ready", desc: "Ready to inject clean dataset into downstream pipelines" }
  ];

  useEffect(() => {
    if (activeStageIndex < stages.length - 1) {
      const timer = setTimeout(() => {
        setActiveStageIndex(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setIsPipelineComplete(true);
    }
  }, [activeStageIndex]);

  // Original records formatting
  const originalRows = originalData?.rows || [];
  const originalHeaders = originalData?.headers || [];

  // Cleaned records formatting
  const cleanRows = cleanedData?.rows || [];
  const cleanHeaders = cleanedData?.headers || [];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Top Banner Control */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-gradient)', padding: '12px', borderRadius: '12px', color: '#fff', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
            <Cpu size={28} className="anim-pulse" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Ingestion & Preprocessing Chamber
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Preparing & healing data asset: <strong style={{ color: '#fff' }}>{fileName}</strong>
            </p>
          </div>
        </div>

        {isPipelineComplete && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={onReset} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              Upload Another
            </button>
            <button className="btn btn-primary" onClick={onSendToAnalytics} style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}>
              <Play size={14} />
              <span>Launch BI Analytics</span>
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Pipeline Stages */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>
            Preprocessing Flow
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stages.map((stage, idx) => {
              const isPast = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;
              const isFuture = idx > activeStageIndex;

              return (
                <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  {/* Step Connector Line */}
                  {idx < stages.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '9px',
                      top: '20px',
                      width: '2px',
                      height: '24px',
                      background: isPast ? 'var(--primary)' : 'rgba(255,255,255,0.08)'
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    {isPast ? (
                      <CheckCircle2 size={20} color="var(--primary)" />
                    ) : isCurrent ? (
                      <div className="anim-pulse" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '4px solid var(--primary)', background: '#fff' }} />
                    ) : (
                      <Circle size={20} color="rgba(255,255,255,0.2)" />
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: isCurrent ? '700' : '500', color: isCurrent ? '#fff' : (isFuture ? 'var(--text-muted)' : 'var(--text-secondary)') }}>
                      {stage.title}
                    </div>
                    {isCurrent && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {stage.desc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Previews / Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tab Selection Row */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
            {[
              { id: 'summary', label: 'Pipeline Summary' },
              { id: 'original', label: 'Original Data' },
              { id: 'cleaned', label: 'Cleaned Data' },
              { id: 'schema', label: 'AI Inferred Schema' },
              { id: 'logs', label: `Transformation Log (${transformationLog.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => isPipelineComplete && setActiveTab(tab.id)}
                disabled={!isPipelineComplete}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  cursor: isPipelineComplete ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  opacity: isPipelineComplete ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pipeline Loading State (Before completion) */}
          {!isPipelineComplete && (
            <div className="glass-panel" style={{ height: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center' }}>
              <div className="anim-pulse" style={{ background: 'var(--primary-gradient)', padding: '24px', borderRadius: '50%', color: '#fff', boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)' }}>
                <Cpu size={40} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>AI Preprocessing Active</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '380px' }}>
                  Please stand by. The PowerAU engine is auditing your file headers, reconstructing formatting discrepancies, and executing healing rules.
                </p>
              </div>
            </div>
          )}

          {/* Active Previews after Completion */}
          {isPipelineComplete && (
            <div className="fade-in">
              
              {/* Tab 1: Summary Panel */}
              {activeTab === 'summary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Metrics Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    
                    <div className="dashboard-card-sm glass-panel glow-primary" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                      <div style={{ display: 'flex', position: 'relative', width: '64px', height: '64px', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ transform: 'rotate(-90deg)', width: '64px', height: '64px' }}>
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="var(--primary)" strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={2 * Math.PI * 28 * (1 - qualityScore / 100)}
                          />
                        </svg>
                        <span style={{ position: 'absolute', fontSize: '0.9rem', fontWeight: '800' }}>{qualityScore}%</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Data Quality Score</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '2px' }}>
                          {qualityScore >= 80 ? 'Optimal Structure' : (qualityScore >= 50 ? 'Stabilized' : 'Heavily Repaired')}
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-card-sm glass-panel glow-cyan" style={{ padding: '20px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completeness Rate</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-cyan)' }}>{completeness}%</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{emptyCount} empty values resolved</div>
                    </div>

                    <div className="dashboard-card-sm glass-panel glow-emerald" style={{ padding: '20px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Heals Executed</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-emerald)' }}>+{healsCount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Corrections logged below</div>
                    </div>

                    <div className="dashboard-card-sm glass-panel glow-rose" style={{ padding: '20px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Anomalies Flagged</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-rose)' }}>{anomaliesCount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Outliers tagged for review</div>
                    </div>

                  </div>

                  {/* Summary Card */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <Activity size={18} color="var(--primary)" />
                      Ingestion Quality Report
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      PowerAU Universal Ingestion has processed the document. It evaluated columns against standard profiles, removed {transformationLog.filter(l => l.type === 'Duplicate Row Purged').length} duplicate rows, parsed numbers from OCR typography, standardized dates/emails/phone numbers, and computed the target model schema.
                    </p>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Row Count</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{cleanRows.length} rows</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Column Count</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{cleanHeaders.length} columns</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated Schema Size</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{schema.length} fields</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Original Extracted Data */}
              {activeTab === 'original' && (
                <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#</th>
                        {originalHeaders.map((h, i) => (
                          <th key={i} style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {originalRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          {originalHeaders.map((h, i) => (
                            <td key={i} style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>{row[h] || ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {originalRows.length > 15 && (
                    <div style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                      Showing first 15 records of {originalRows.length} extracted records
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Cleaned Data */}
              {activeTab === 'cleaned' && (
                <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#</th>
                        {cleanHeaders.map((h, i) => (
                          <th key={i} style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cleanRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          {cleanHeaders.map((h, i) => (
                            <td key={i} style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>{row[h] || ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {cleanRows.length > 15 && (
                    <div style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                      Showing first 15 records of {cleanRows.length} structured records
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: AI Schema */}
              {activeTab === 'schema' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {schema.map((col, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff', wordBreak: 'break-all' }}>{col.name}</div>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          {col.type}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Quality Completeness:</span>
                          <span style={{ color: '#fff', fontWeight: '600' }}>{col.completeness}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${col.completeness}%`, height: '100%', background: 'var(--primary)' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <Key size={12} color="var(--primary)" />
                        <span>Semantic Tag: <strong>{col.classification}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 5: Transformation Log */}
              {activeTab === 'logs' && (
                <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', width: '80px' }}>Row ID</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', width: '140px' }}>Column</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', width: '180px' }}>Operation</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Correction Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transformationLog.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '24px', textHeading: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                            No corrections required. Uploaded file structure complies perfectly with canonical ledger constraints.
                          </td>
                        </tr>
                      ) : (
                        transformationLog.map((log, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '10px 16px', fontWeight: '600', color: 'var(--text-muted)' }}>{log.row}</td>
                            <td style={{ padding: '10px 16px', color: '#fff', fontWeight: '500' }}>{log.column}</td>
                            <td style={{ padding: '10px 16px' }}>
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: log.type.includes('Deleted') || log.type.includes('Purged') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: log.type.includes('Deleted') || log.type.includes('Purged') ? '#f43f5e' : '#10b981',
                                fontWeight: '600'
                              }}>
                                {log.type}
                              </span>
                            </td>
                            <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{log.description}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
