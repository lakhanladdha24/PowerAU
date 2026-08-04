import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, RefreshCw, Layers, CheckCircle, Server, Activity } from 'lucide-react';

export default function MultiAgentConsole({ datasetName, anomalies, context }) {
  // Simulated Kafka broker telemetry
  const [kafkaOffsets, setKafkaOffsets] = useState([41820, 39540, 40112]);
  const [kafkaLag, setKafkaLag] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const terminalEndRef = useRef(null);

  const agents = [
    { name: 'Data Engineer Agent', role: 'ETL & Schema Repair', desc: 'Validates formatting, re-aligns drifts, and imputes null entries.', color: '#3b82f6', status: 'idle' },
    { name: 'Insight Agent', role: 'Business Intelligence', desc: 'Analyzes categories, calculates KPIs, and outputs context anomalies.', color: '#06b6d4', status: 'idle' },
    { name: 'Dashboard Agent', role: 'Dynamic UI Layout', desc: 'Prioritizes important KPI cards and updates chart parameters.', color: '#10b981', status: 'idle' },
    { name: 'Forecast Agent', role: 'Predictive Horizons', desc: 'Fits regression slopes and computes attrition risk probabilities.', color: '#a855f7', status: 'idle' },
    { name: 'Decision Agent', role: 'What-If Simulation', desc: 'Simulates price change scenarios and calculates inventory margins.', color: '#f59e0b', status: 'idle' },
    { name: 'Audit Agent', role: 'Governance & PII', desc: 'Secures compliance, tracks history, and masks private indicators.', color: '#f43f5e', status: 'idle' }
  ];

  const [activeAgents, setActiveAgents] = useState(agents);

  const runOrchestrator = useCallback(() => {
    setIsOrchestrating(true);
    setLogs([]);
    
    const timestamp = () => new Date().toLocaleTimeString();
    
    // Sequence simulated logs to show collaboration
    const sequence = [
      { delay: 100, agentIdx: 0, text: `[Data Engineer Agent] Ingesting raw stream. Scanning headers...`, status: 'active' },
      { delay: 800, agentIdx: 0, text: `[Data Engineer Agent] Inconsistent headers found. Remapping schema elements semantically.`, status: 'active' },
      { delay: 1500, agentIdx: 5, text: `[Audit Agent] Intercepted stream for governance check. Flagged columns with potential PII. Security masking ready.`, status: 'active' },
      { delay: 2200, agentIdx: 0, text: `[Data Engineer Agent] Applied smart imputation for missing values. Deduplicated rows. ETL pipeline complete.`, status: 'success' },
      { delay: 2800, agentIdx: 1, text: `[Insight Agent] Ingestion payload received. Analyzing business context context: '${context.toUpperCase()}'.`, status: 'active' },
      { delay: 3500, agentIdx: 1, text: `[Insight Agent] Evaluated business constraints. Flagged ${anomalies.length} outliers. Calculated standard KPIs.`, status: 'success' },
      { delay: 4200, agentIdx: 3, text: `[Forecast Agent] Running regression fit algorithms. Projecting future trends.`, status: 'active' },
      { delay: 4900, agentIdx: 3, text: `[Forecast Agent] Calculated 6-period forecast values with 95% confidence bands. Completed churn risk classification.`, status: 'success' },
      { delay: 5600, agentIdx: 4, text: `[Decision Agent] Loaded simulation scenario tables. Prescriptive actions mapped.`, status: 'success' },
      { delay: 6200, agentIdx: 2, text: `[Dashboard Agent] Rendering dynamic visual cards. Reordered layouts to prioritize critical alerts.`, status: 'success' },
      { delay: 6800, agentIdx: 5, text: `[Audit Agent] Compiling compliance logs. Pre-flight compatibility checks passed. Platform BI Ready.`, status: 'success' }
    ];

    sequence.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { time: timestamp(), text: step.text }]);
        
        setActiveAgents(prev => prev.map((ag, aIdx) => {
          if (aIdx === step.agentIdx) {
            return { ...ag, status: step.status };
          }
          return ag;
        }));

        if (idx === sequence.length - 1) {
          setIsOrchestrating(false);
        }
      }, step.delay);
    });
  }, [context, anomalies]);

  useEffect(() => {
    Promise.resolve().then(() => {
      runOrchestrator();
    });
  }, [datasetName, runOrchestrator]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let interval = null;
    if (isOrchestrating) {
      Promise.resolve().then(() => {
        setKafkaLag(15);
      });
      interval = setInterval(() => {
        setKafkaOffsets(prev => prev.map(o => o + Math.floor(Math.random() * 8) + 2));
        setKafkaLag(prev => Math.max(0, prev - Math.floor(Math.random() * 2) - 1));
      }, 700);
    } else {
      Promise.resolve().then(() => {
        setKafkaLag(0);
      });
      interval = setInterval(() => {
        setKafkaOffsets(prev => prev.map(o => o + Math.floor(Math.random() * 2)));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isOrchestrating]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Orchestration Controller */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--primary)" />
            AI Orchestrator Core Control
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Collaborating multi-agent network automating engineering, BI, forecasting, decisions, and governance.
          </p>
        </div>
        <button 
          onClick={runOrchestrator} 
          disabled={isOrchestrating}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '8px', padding: '8px 16px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={isOrchestrating ? 'anim-spin' : ''} />
          <span>{isOrchestrating ? 'Orchestrating...' : 'Trigger Pipeline Re-run'}</span>
        </button>
      </div>

      {/* 2. Agents Grid */}
      <div className="dashboard-grid">
        {activeAgents.map((ag, i) => (
          <div 
            key={i} 
            className="dashboard-card-sm glass-panel" 
            style={{ 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              gap: '12px',
              borderLeft: `4px solid ${ag.color}`,
              background: ag.status === 'active' ? 'rgba(255,255,255,0.02)' : 'rgba(12,16,32,0.7)',
              boxShadow: ag.status === 'active' ? `0 0 15px rgba(255, 255, 255, 0.05)` : 'none'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="agent-card-name" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{ag.name}</span>
                <span className={`badge ${
                  ag.status === 'active' 
                    ? 'badge-amber anim-pulse' 
                    : ag.status === 'success' 
                      ? 'badge-emerald' 
                      : 'badge-primary'
                }`} style={{ fontSize: '0.55rem' }}>
                  {ag.status === 'active' ? 'Working' : ag.status === 'success' ? 'Completed' : 'Standby'}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: ag.color, fontWeight: '600', marginTop: '2px', textTransform: 'uppercase' }}>
                {ag.role}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                {ag.desc}
              </p>
            </div>
            {ag.status === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle size={10} /> Task Handover Completed
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. Terminal & Broker Split Grid */}
      <div className="dashboard-grid">
        
        {/* Live Agent Terminal Console */}
        <div className="glass-panel glow-primary" style={{ gridColumn: 'span 8', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="var(--primary)" />
            Orchestrator Agent Communication Log
          </h3>
          
          <div className="terminal-console" style={{ height: '240px', overflowY: 'auto' }}>
            {logs.length > 0 ? (
              logs.map((l, index) => (
                <div key={index} className="terminal-line">
                  <span className="terminal-time">[{l.time}]</span>
                  <span className="terminal-info" style={{ color: l.text.includes('[Audit') ? 'var(--accent-rose)' : l.text.includes('[Forecast') ? 'var(--accent-purple)' : l.text.includes('[Data Engineer') ? '#3b82f6' : 'var(--text-primary)' }}> {l.text}</span>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Awaiting orchestrator trigger sequence...
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Kafka Broker Stream Monitor */}
        <div className="glass-panel glow-cyan" style={{ gridColumn: 'span 4', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={16} color="var(--accent-cyan)" />
            Kafka Broker Telemetry (DataOS)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Broker Status list */}
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Broker Nodes Status
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['kafka-broker-1', 'kafka-broker-2', 'kafka-broker-3'].map((b) => (
                  <div key={b} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{b}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                      <span className="bullet-active" style={{ background: 'var(--accent-emerald)', width: '6px', height: '6px', boxShadow: '0 0 6px var(--accent-emerald)' }} />
                      ONLINE
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partition Offsets list */}
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Partition Commits (Offsets)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {kafkaOffsets.map((offset, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Partition {idx}</span>
                      <span className="kafka-offset-val" style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#fff' }}>
                        {offset.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: 'var(--cyan-gradient)', 
                          width: `${(offset % 100)}%` 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consumer Lag */}
            <div style={{ background: kafkaLag > 0 ? 'rgba(244,63,94,0.03)' : 'rgba(0,0,0,0.15)', border: kafkaLag > 0 ? '1px solid rgba(244,63,94,0.2)' : '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>
                  Consumer Group Lag
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: kafkaLag > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {kafkaLag} messages
                </span>
              </div>
              <Activity size={18} className={kafkaLag > 0 ? 'anim-pulse' : ''} color={kafkaLag > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'} />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
