import { useEffect, useRef } from 'react';
import { Terminal, Shield, ListFilter } from 'lucide-react';

export default function DataAuditor({ 
  anomalies, 
  globalQualityScore, 
  showCleaned, 
  onToggleCleaned,
  changesLog,
  datasetName
}) {
  const terminalEndRef = useRef(null);

  // Auto scroll terminal to bottom on change
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [changesLog]);

  // Generate mock logs based on real changes
  const getLogLines = () => {
    const logs = [];
    const timestamp = new Date().toLocaleTimeString();

    logs.push({ time: timestamp, type: 'info', text: `Initiating ingestion for ${datasetName || 'uploaded dataset'}...` });
    logs.push({ time: timestamp, type: 'info', text: `Analyzing schema & structure...` });
    
    if (changesLog && changesLog.length > 0) {
      // Group changes
      const dupCount = changesLog.filter(c => c.type === 'Duplicate Row Removed').length;
      const imputeCount = changesLog.filter(c => c.type === 'Imputed Value').length;
      const dateCount = changesLog.filter(c => c.type === 'Normalized Date').length;
      const emailCount = changesLog.filter(c => c.type === 'Normalized Email').length;
      const phoneCount = changesLog.filter(c => c.type === 'Normalized Phone').length;
      const castCount = changesLog.filter(c => c.type.startsWith('Cast') || c.type.startsWith('Healed Invalid')).length;
      const caseCount = changesLog.filter(c => c.type === 'Standardized Casing').length;

      logs.push({ time: timestamp, type: 'warning', text: `Audit detected: ${anomalies.length} quality alerts.` });
      
      if (dupCount > 0) {
        logs.push({ time: timestamp, type: 'heal', text: `AI: Detected ${dupCount} duplicate rows. Applying deduplication (purging redundant records).` });
      }
      if (dateCount > 0) {
        logs.push({ time: timestamp, type: 'heal', text: `AI: Normalizing ${dateCount} inconsistent dates to ISO 8601 formatting.` });
      }
      if (emailCount > 0) {
        logs.push({ time: timestamp, type: 'heal', text: `AI: Healing spelling and domain errors in ${emailCount} email address strings.` });
      }
      if (phoneCount > 0) {
        logs.push({ time: timestamp, type: 'heal', text: `AI: Sanitizing and masking phone strings for ${phoneCount} records.` });
      }
      if (imputeCount > 0) {
        logs.push({ time: timestamp, type: 'heal', text: `AI: Imputing ${imputeCount} missing cells using statistical column mean/median values.` });
      }
      if (castCount > 0) {
        logs.push({ time: timestamp, type: 'heal', text: `AI: Repairing ${castCount} invalid type values and casting numeric structures.` });
      }
      if (caseCount > 0) {
        logs.push({ time: timestamp, type: 'heal', text: `AI: Correcting and standardizing text string cases to Title-case (e.g. city names, company states).` });
      }

      // Add individual samples
      changesLog.slice(0, 8).forEach(c => {
        if (c.type === 'Duplicate Row Removed') return;
        logs.push({
          time: timestamp,
          type: 'heal',
          text: `• [Row ${c.row}] Fixed '${c.column}': Changed '${c.oldValue || 'BLANK'}' ➔ '${c.newValue}' (${c.type})`
        });
      });

      if (changesLog.length > 8) {
        logs.push({ time: timestamp, type: 'heal', text: `• ... and ${changesLog.length - 8} more repairs applied successfully.` });
      }

      logs.push({ 
        time: timestamp, 
        type: 'success', 
        text: `Pipeline Auto-Healing Process Completed! Quality raised to ${globalQualityScore}%. BI-Ready structured output created.` 
      });
    } else {
      logs.push({ time: timestamp, type: 'success', text: `Dataset is clean. Inferred schema maps perfectly. Quality Score: 100%.` });
    }

    return logs;
  };

  const logs = getLogLines();

  return (
    <div className="dashboard-grid fade-in">
      {/* A. Healing Engine Log Console */}
      <div className="dashboard-card-lg glass-panel glow-primary" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="var(--primary)" />
            Self-Healing AI Agent Logs
          </h3>
          <span className="badge badge-primary">Auto-Pipeline Active</span>
        </div>

        <div className="terminal-console">
          {logs.map((log, index) => (
            <div key={index} className="terminal-line">
              <span className="terminal-time">[{log.time}]</span>
              <span className={`terminal-${log.type}`}>
                {log.type === 'info' && '[INFO] '}
                {log.type === 'warning' && '[WARN] '}
                {log.type === 'heal' && '[HEAL] '}
                {log.type === 'success' && '[SUCCESS] '}
                {log.text}
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* B. Quality Score breakdown and Switch slider */}
      <div className="dashboard-card-sm glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Shield size={16} color="var(--accent-emerald)" />
            Data Quality Audit
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Metric 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Completeness</span>
                <span>{Math.round(100 - (anomalies.filter(a => a.type === 'Missing Value').length / Math.max(1, anomalies.length)) * 10)}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: 'var(--primary)', 
                    width: `${Math.max(20, Math.round(100 - (anomalies.filter(a => a.type === 'Missing Value').length / Math.max(1, anomalies.length || 1)) * 10))}%` 
                  }} 
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Format Validity</span>
                <span>{Math.round(100 - (anomalies.filter(a => a.type === 'Format Issue').length / Math.max(1, anomalies.length)) * 10)}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: 'var(--accent-cyan)', 
                    width: `${Math.max(20, Math.round(100 - (anomalies.filter(a => a.type === 'Format Issue').length / Math.max(1, anomalies.length || 1)) * 10))}%` 
                  }} 
                />
              </div>
            </div>

            {/* Metric 3 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Accuracy & Uniqueness</span>
                <span>{Math.round(100 - (anomalies.filter(a => a.type === 'Duplicate Row').length / Math.max(1, anomalies.length)) * 10)}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: 'var(--accent-emerald)', 
                    width: `${Math.max(20, Math.round(100 - (anomalies.filter(a => a.type === 'Duplicate Row').length / Math.max(1, anomalies.length || 1)) * 10))}%` 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Before vs After Switch */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Pipeline View Mode
          </div>
          <div className="compare-toggle-container">
            <button 
              className={`compare-toggle-btn ${!showCleaned ? 'active' : ''}`}
              onClick={() => onToggleCleaned(false)}
            >
              Raw (Messy)
            </button>
            <button 
              className={`compare-toggle-btn ${showCleaned ? 'active' : ''}`}
              onClick={() => onToggleCleaned(true)}
            >
              Healed (Clean)
            </button>
          </div>
        </div>
      </div>

      {/* C. Quality Alerts List */}
      {anomalies.length > 0 && (
        <div className="dashboard-card-xl glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ListFilter size={16} color="var(--accent-rose)" />
            Detected Anomalies Profile ({anomalies.length} alerts)
          </h3>
          <div className="data-table-container" style={{ maxHeight: '180px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Column</th>
                  <th>Anomaly Type</th>
                  <th>Messy Value</th>
                  <th>Diagnostic Explanation</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>#{anomaly.row}</td>
                    <td><span className="badge badge-primary">{anomaly.column}</span></td>
                    <td>
                      <span className={`badge ${anomaly.type === 'Missing Value' ? 'badge-amber' : anomaly.type === 'Outlier' ? 'badge-purple' : 'badge-rose'}`}>
                        {anomaly.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-rose)' }}>
                      {anomaly.value === '' ? '[BLANK]' : String(anomaly.value)}
                    </td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'normal' }}>{anomaly.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
