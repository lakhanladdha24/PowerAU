import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Zap, Cpu, Award } from 'lucide-react';
import { webSocketManager } from '../websocket/websocketSimulator';
import { 
  generateStockRecord, 
  generateIoTRecord, 
  generateSalesRecord, 
  generateLogisticsRecord,
  validateRecord,
  cleanStreamingRecord,
  detectStreamAnomaly 
} from '../streaming/streamingSimulators';
import { evaluateStreamingModels } from '../modules/realtime/realtimeMLPipeline';
import LiveDashboards from '../live-dashboard/LiveDashboards';
import RealTimeCopilot from './RealTimeCopilot';

export default function RealTimeAnalytics() {
  const [selectedSource, setSelectedSource] = useState('stocks'); // stocks, iot, sales, logistics
  const [sourceType, setSourceType] = useState('WebSocket APIs'); // MQTT, Kafka, CRM, etc.
  const [streamFrequency, setStreamFrequency] = useState(2000); // ms
  
  // Connection metrics
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [latency, setLatency] = useState(0);
  const [kbTransferred, setKbTransferred] = useState('0.00');

  // Ingestion stats
  const [totalIngested, setTotalIngested] = useState(0);
  const [validationFailures, setValidationFailures] = useState(0);
  const [anomaliesDetected, setAnomaliesDetected] = useState(0);
  
  // Data history buffer
  const [streamHistory, setStreamHistory] = useState([]);
  const [anomaliesLog, setAnomaliesLog] = useState([]);

  // Active sub-view tab
  const [activeSubTab, setActiveSubTab] = useState('dashboard'); // dashboard, ml_model

  // Reference for stream counter to keep clean indexing
  const streamHistoryRef = useRef([]);

  const url = `ws://api.neuroflux.ai/stream/${selectedSource}`;

  const handleResetStream = () => {
    webSocketManager.disconnect();
    setConnectionStatus('disconnected');
    setTotalIngested(0);
    setValidationFailures(0);
    setAnomaliesDetected(0);
    setStreamHistory([]);
    setAnomaliesLog([]);
    streamHistoryRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webSocketManager.disconnect();
    };
  }, []);

  // Connect to the simulated websocket
  const handleConnect = () => {
    let generatorFunc;
    if (selectedSource === 'stocks') generatorFunc = generateStockRecord;
    else if (selectedSource === 'iot') generatorFunc = generateIoTRecord;
    else if (selectedSource === 'sales') generatorFunc = generateSalesRecord;
    else if (selectedSource === 'logistics') generatorFunc = generateLogisticsRecord;

    setConnectionStatus('connecting');

    webSocketManager.connect(
      selectedSource,
      (msg) => {
        if (msg.type === 'system_alert') {
          // Handle connection errors
          setAnomaliesLog(prev => [...prev, {
            timestamp: Date.now(),
            reason: msg.message
          }]);
          setConnectionStatus('error');
          return;
        }

        // 1. Raw record arrival
        const rawPayload = msg.payload;

        // 2. Validate
        const valResult = validateRecord(selectedSource, rawPayload);
        if (!valResult.isValid) {
          setValidationFailures(prev => prev + 1);
          setAnomaliesLog(prev => [...prev, {
            timestamp: Date.now(),
            reason: `Validation error: ${valResult.errors.join(', ')}`
          }]);
          return; // discard invalid records
        }

        // 3. Clean & Preprocess (Self-Healing)
        const cleanedPayload = cleanStreamingRecord(selectedSource, rawPayload);

        // 4. Anomaly detection (Outliers)
        const anomalyResult = detectStreamAnomaly(selectedSource, cleanedPayload);
        if (anomalyResult.isAnomaly) {
          setAnomaliesDetected(prev => prev + 1);
          setAnomaliesLog(prev => [...prev, {
            timestamp: Date.now(),
            reason: anomalyResult.reason
          }]);
        }

        // 5. Append to history buffer
        const recordWithMetadata = {
          ...cleanedPayload,
          offset: msg.offset,
          latency: msg.latency,
          timestamp: msg.timestamp
        };

        const updatedHistory = [...streamHistoryRef.current, recordWithMetadata];
        streamHistoryRef.current = updatedHistory;
        setStreamHistory(updatedHistory);
        setTotalIngested(prev => prev + 1);
      },
      (statusUpdate) => {
        setConnectionStatus(statusUpdate.status);
        setLatency(statusUpdate.latency);
        setKbTransferred(statusUpdate.kbTransferred);
      },
      streamFrequency,
      generatorFunc
    );
  };

  const handleDisconnect = () => {
    webSocketManager.disconnect();
    setConnectionStatus('disconnected');
  };

  // Reset stream handled directly via onChange handler

  const handleSingleTick = () => {
    // Manually trigger one event ingestion
    let generatorFunc;
    if (selectedSource === 'stocks') generatorFunc = generateStockRecord;
    else if (selectedSource === 'iot') generatorFunc = generateIoTRecord;
    else if (selectedSource === 'sales') generatorFunc = generateSalesRecord;
    else if (selectedSource === 'logistics') generatorFunc = generateLogisticsRecord;

    const rawPayload = generatorFunc();
    const valResult = validateRecord(selectedSource, rawPayload);
    if (!valResult.isValid) {
      setValidationFailures(prev => prev + 1);
      return;
    }

    const cleanedPayload = cleanStreamingRecord(selectedSource, rawPayload);
    const anomalyResult = detectStreamAnomaly(selectedSource, cleanedPayload);
    if (anomalyResult.isAnomaly) {
      setAnomaliesDetected(prev => prev + 1);
      setAnomaliesLog(prev => [...prev, {
        timestamp: Date.now(),
        reason: anomalyResult.reason
      }]);
    }

    const recordWithMetadata = {
      ...cleanedPayload,
      offset: streamHistoryRef.current.length + 1,
      latency: 22,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...streamHistoryRef.current, recordWithMetadata];
    streamHistoryRef.current = updatedHistory;
    setStreamHistory(updatedHistory);
    setTotalIngested(prev => prev + 1);
  };

  // Run model evaluation reports based on historical stream inputs
  const mlReport = evaluateStreamingModels(selectedSource, streamHistory);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Control Panel & Source Selector */}
      <div className="dashboard-grid">
        
        {/* Source and credentials configuration */}
        <div className="dashboard-card-lg glass-panel" style={{ gridColumn: 'span 8', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--primary)" />
            Real-Time Streaming Analytics Ingestion Port
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Select an enterprise integration source, configure connection parameters, and spawn streaming event pipelines.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Telemetry Domain</label>
              <select 
                value={selectedSource} 
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  handleResetStream();
                }}
                className="input-field"
                style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.8rem', height: '34px' }}
              >
                <option value="stocks">Stock Market Telemetry (NFLX Options)</option>
                <option value="iot">IoT Manufacturing (Robotic Arm Assembly)</option>
                <option value="sales">Sales & E-commerce (NeuroFlux SaaS checkouts)</option>
                <option value="logistics">Logistics & Fleet (SF Transit Corridor)</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ingestion Interface</label>
              <select 
                value={sourceType} 
                onChange={(e) => setSourceType(e.target.value)}
                className="input-field"
                style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.8rem', height: '34px' }}
              >
                <option value="Stock Market APIs">Market API Feeds</option>
                <option value="IoT Devices">IoT Sensors</option>
                <option value="MQTT">MQTT Broker</option>
                <option value="Kafka Streams">Kafka Cluster</option>
                <option value="WebSocket APIs">WebSocket Gateway</option>
                <option value="REST APIs">REST Webhooks</option>
                <option value="Enterprise Databases">Databases (PostgreSQL)</option>
                <option value="CSV Auto Watcher">CSV Folder Watcher</option>
                <option value="ERP Systems">ERP Core</option>
                <option value="CRM Systems">CRM (Salesforce)</option>
              </select>
            </div>

            <div style={{ width: '120px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Frequency (ms)</label>
              <select 
                value={streamFrequency} 
                onChange={(e) => setStreamFrequency(Number(e.target.value))}
                className="input-field"
                style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.8rem', height: '34px' }}
              >
                <option value={1000}>1000ms (High)</option>
                <option value={2000}>2000ms (Medium)</option>
                <option value={4000}>4000ms (Low)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>URI Endpoint:</span>
            <input 
              type="text" 
              value={url} 
              readOnly 
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
            />
          </div>
        </div>

        {/* Streaming active controls */}
        <div className="dashboard-card-sm glass-panel glow-primary" style={{ gridColumn: 'span 4', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-secondary)' }}>
            Stream Controller
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {connectionStatus === 'connected' ? (
              <button 
                onClick={handleDisconnect} 
                className="btn btn-rose" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                <Pause size={14} /> Pause Stream
              </button>
            ) : (
              <button 
                onClick={handleConnect} 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                <Play size={14} /> Start Real-time Stream
              </button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={handleSingleTick} 
                disabled={connectionStatus === 'connected'}
                className="btn btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '8px' }}
              >
                Ingest Single Tick
              </button>
              <button 
                onClick={handleResetStream} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '8px', color: 'var(--accent-rose)' }}
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
            <span>Pipeline Status:</span>
            <span 
              className={`badge ${
                connectionStatus === 'connected' ? 'badge-emerald' : 
                connectionStatus === 'connecting' ? 'badge-amber' : 
                connectionStatus === 'error' ? 'badge-rose' : 'badge-primary'
              }`}
              style={{ fontSize: '0.65rem' }}
            >
              {connectionStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Real-time metrics dashboard banner */}
      <div className="dashboard-grid">
        <div className="dashboard-card-sm glass-panel glow-cyan" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Ingested Events</span>
          <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: '#fff' }}>
            {totalIngested} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>records</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Parsed offsets in current queue</div>
        </div>

        <div className="dashboard-card-sm glass-panel glow-emerald" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600', textTransform: 'uppercase' }}>Validated & Preprocessed</span>
          <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-emerald)' }}>
            {totalIngested > 0 ? (((totalIngested - validationFailures) / totalIngested) * 100).toFixed(0) + '%' : '100%'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Passed: {totalIngested - validationFailures} / Failed: {validationFailures}
          </div>
        </div>

        <div className="dashboard-card-sm glass-panel glow-rose" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', fontWeight: '600', textTransform: 'uppercase' }}>Statistical Outliers</span>
          <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-rose)' }}>
            {anomaliesDetected}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Flagged by SD check boundaries</div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Performance Load</span>
          <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: '#fff' }}>
            {latency} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Network Transfer rate: {kbTransferred} KB</div>
        </div>
      </div>

      {/* 3. Sub-Navigation and Primary Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px' }}>
        
        {/* Left Side: Live Charts or ML Evaluation reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub tab toggler */}
          <div className="os-navigation-dock compare-toggle-container" style={{ width: '100%', marginBottom: '4px', display: 'flex' }}>
            <button 
              className={`compare-toggle-btn ${activeSubTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('dashboard')}
              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Cpu size={14} /> Live Telemetry Dashboards
            </button>
            <button 
              className={`compare-toggle-btn ${activeSubTab === 'ml_model' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('ml_model')}
              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Award size={14} /> ML Pipeline & Tuning Hub
            </button>
          </div>

          {activeSubTab === 'dashboard' && (
            <LiveDashboards 
              domain={selectedSource} 
              dataHistory={streamHistory} 
              anomalies={anomaliesLog} 
            />
          )}

          {activeSubTab === 'ml_model' && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={18} color="var(--primary)" />
                    Stream ML Pipeline Evaluation Report
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Runs 5-fold cross-validation and correlation-based feature selection on live memory log buffer.
                  </p>
                </div>
                <span className="badge badge-purple">Optimized Ridge Model</span>
              </div>

              {mlReport.status === 'Warmup' ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} style={{ marginBottom: '10px' }} className="anim-pulse" />
                  <p style={{ fontSize: '0.8rem' }}>{mlReport.message}</p>
                  <span className="badge badge-amber" style={{ marginTop: '10px' }}>
                    Ingested {streamHistory.length} / 15 buffer items
                  </span>
                </div>
              ) : (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* CV & Baseline Accuracy Panel */}
                  <div className="dashboard-grid">
                    <div className="dashboard-card-sm glass-panel glow-emerald" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                        Cross-Validation F1-Score
                      </span>
                      <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-emerald)' }}>
                        {(mlReport.evaluation.f1Score * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        True calculated 5-fold CV score
                      </div>
                    </div>

                    <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                        Model Accuracy
                      </span>
                      <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                        {(mlReport.evaluation.accuracy * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Prediction boundary accuracy
                      </div>
                    </div>

                    <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                        Baseline Accuracy (Dummy)
                      </span>
                      <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                        {(mlReport.evaluation.baselineAccuracy * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Zero-rule classification rate
                      </div>
                    </div>
                  </div>

                  {/* Feature selection Pearson Correlation rankings */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px' }}>
                      Feature Selection Correlation Weights
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {mlReport.features.map((feat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{feat.feature}</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', position: 'relative' }}>
                              <div style={{ position: 'absolute', height: '100%', width: `${feat.absoluteCorrelation * 100}%`, background: 'var(--primary)', borderRadius: '3px' }} />
                            </div>
                            <span style={{ width: '40px', textAlign: 'right', fontWeight: '600', color: feat.absoluteCorrelation > 0.4 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                              r={feat.correlation}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hyperparameter grid selection metrics */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px' }}>
                      Hyperparameter Grid Search (3-Fold CV F1-Score)
                    </h4>
                    <div className="data-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Learning Rate (eta)</th>
                            <th>L2 Penalty (lambda)</th>
                            <th>Accuracy</th>
                            <th>CV F1-Score</th>
                            <th>Select State</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mlReport.tuning.tuningGrid.map((row, idx) => {
                            const isBest = row.lr === mlReport.tuning.bestParams.lr && row.lambda === mlReport.tuning.bestParams.lambda;
                            return (
                              <tr key={idx} style={{ background: isBest ? 'rgba(99, 102, 241, 0.05)' : 'none' }}>
                                <td>{row.lr}</td>
                                <td>{row.lambda}</td>
                                <td>{(row.accuracy * 100).toFixed(1)}%</td>
                                <td style={{ fontWeight: '700', color: isBest ? 'var(--accent-cyan)' : 'inherit' }}>
                                  {(row.f1 * 100).toFixed(1)}%
                                </td>
                                <td>
                                  {isBest ? (
                                    <span className="badge badge-cyan" style={{ fontSize: '0.55rem' }}>✓ Active Best</span>
                                  ) : (
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Evaluated</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: AI Copilot Drawer */}
        <div>
          <RealTimeCopilot 
            domain={selectedSource} 
            dataHistory={streamHistory} 
            anomalies={anomaliesLog} 
          />
        </div>

      </div>

    </div>
  );
}
