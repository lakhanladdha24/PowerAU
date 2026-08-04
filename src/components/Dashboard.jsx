import { useState } from 'react';
import { Upload, Database, ShoppingBag, Users, Cpu, FileText, Sliders, BarChart, RefreshCw } from 'lucide-react';
import { generateMessySample } from '../utils/healingEngine';

export default function Dashboard({ 
  onDatasetLoad, 
  datasetName, 
  stats, 
  onReset,
  delimiter,
  onDelimiterChange,
  imputeNumeric,
  onImputeNumericChange
}) {
  const [isDragging, setIsDragging] = useState(false);

  // File drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      onDatasetLoad(file.name, event.target.result);
    };
    reader.readAsText(file);
  };

  const loadSample = (type) => {
    const sample = generateMessySample(type);
    onDatasetLoad(sample.name, sample.data);
  };

  const loadDriftSample = () => {
    const driftData = `id,ClientFullName,ClientEmailAddress,Signup_Timestamp,PaymentsVolume,phone
1,Robert Downey,robert.d@gmail.com,10/12/2024,450.00,+1 (555) 123-4567
2,Jane Foster,jane.f@gmial.com,11-12-2024,120.00,
3,Bruce Banner,bruce.b@gmail.com,,300.00,5550193399
4,Tony Stark,tony@starkindustries,,129.50,5550193388
5,Tony Stark,tony@starkindustries,,129.50,5550193388`;
    onDatasetLoad('drifted_customer_ledger.csv', driftData);
  };

  const loadKaggleDataset = () => {
    fetch('/Unclean Dataset.csv')
      .then(res => {
        if (!res.ok) throw new Error("File not found");
        return res.text();
      })
      .then(text => {
        onDatasetLoad('Unclean Dataset.csv', text);
      })
      .catch(err => {
        console.error("Failed to load Kaggle dataset", err);
        alert("Could not load Kaggle dataset. Please upload the 'Unclean Dataset.csv' manually or ensure it is in the public directory.");
      });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header KPIs */}
      {stats && (
        <div className="dashboard-grid">
          <div className="dashboard-card-sm glass-panel glow-cyan gauge-card">
            <div className="gauge-circle-wrapper">
              <svg className="gauge-svg">
                <circle className="gauge-bg" cx="32" cy="32" r="28" />
                <circle 
                  className="gauge-progress" 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="var(--accent-cyan)"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(100, stats.qualityScore) / 100)}`}
                />
              </svg>
              <div className="gauge-text">{stats.qualityScore}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Quality Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '2px' }}>
                {stats.qualityScore >= 80 ? 'Healthy' : stats.qualityScore >= 50 ? 'Needs Work' : 'Critical'}
              </div>
            </div>
          </div>

          <div className="dashboard-card-sm glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Processed Data</div>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: '#fff' }}>{stats.rowCount} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>rows</span></div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stats.colCount} structured columns</div>
          </div>

          <div className="dashboard-card-sm glass-panel glow-emerald" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '600', textTransform: 'uppercase' }}>Auto-Healed Cells</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-emerald)' }}>+{stats.healedCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Anomalies fixed instantly</div>
          </div>

          <div className="dashboard-card-sm glass-panel glow-rose" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', fontWeight: '600', textTransform: 'uppercase' }}>Duplicates Deleted</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-rose)' }}>{stats.duplicateCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Redundancies purged</div>
          </div>
        </div>
      )}

      {/* 2. File Upload Dropzone */}
      {!datasetName ? (
        <div 
          className={`upload-dropzone glass-panel glow-primary ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ padding: '40px 20px', position: 'relative', overflow: 'hidden' }}
        >
          {/* Animated Hologram Chamber Grid */}
          <div className="hologram-grid-bg" />
          
          <input 
            type="file" 
            id="csv-file-input" 
            accept=".csv, .tsv, .json, .xml, .yaml, .yml, .xls, .txt" 
            onChange={handleFileSelect} 
            style={{ display: 'none' }}
          />
          <label htmlFor="csv-file-input" style={{ cursor: 'pointer', display: 'block', zIndex: 2, position: 'relative' }}>
            <div className="upload-icon-wrapper anim-pulse" style={{ margin: '0 auto 16px' }}>
              <Upload size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Ingestion Chamber: Upload Messy Business Data</h3>
            <p style={{ maxWidth: '540px', margin: '0 auto 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Drag & drop CSV, TSV, JSON, XML, YAML, or Excel XML files. The NeuroFlux semantic engine will auto-detect schemas, align drifted headers, and compile clean target ledger sets.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '640px', margin: '0 auto 20px' }}>
              {['CSV', 'TSV', 'JSON', 'XML', 'YAML', 'Excel XML', 'TXT', 'SQL Database', 'REST APIs', 'CRM/ERP', 'Live Streams'].map(c => (
                <span key={c} style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                  {c}
                </span>
              ))}
            </div>
            <span className="btn btn-primary">Scan & Load File</span>
          </label>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-gradient)', padding: '8px', borderRadius: '8px' }}>
              <FileText size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Ingested File</div>
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>{datasetName}</div>
            </div>
          </div>

          {/* Delimiter Selection Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Sliders size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>CSV Delimiter:</span>
            <select 
              value={delimiter}
              onChange={(e) => onDelimiterChange(e.target.value)}
              className="input-field"
              style={{ width: '130px', padding: '4px 8px', fontSize: '0.8rem', background: 'var(--bg-surface-elevated)' }}
            >
              <option value="auto">Auto-Detect</option>
              <option value="comma">Comma ( , )</option>
              <option value="semicolon">Semicolon ( ; )</option>
              <option value="tab">Tab ( \t )</option>
              <option value="pipe">Pipe ( | )</option>
            </select>
          </div>

          {/* Imputation Strategy Selection Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Sliders size={16} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Numeric Imputation:</span>
            <select 
              value={imputeNumeric}
              onChange={(e) => onImputeNumericChange(e.target.value)}
              className="input-field"
              style={{ width: '110px', padding: '4px 8px', fontSize: '0.8rem', background: 'var(--bg-surface-elevated)' }}
            >
              <option value="mean">Mean</option>
              <option value="median">Median</option>
              <option value="mode">Mode</option>
            </select>
          </div>

          <button className="btn btn-secondary" onClick={onReset}>Clear & Ingest New</button>
        </div>
      )}

      {/* 3. Sample Datasets Section */}
      {!datasetName && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--primary)" />
            Load Messy Pre-packaged Sandbox Datasets
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Explore the self-healing platform instantly by clicking one of the sample datasets below containing messy dates, emails, duplicates, and missing numeric entries.
          </p>

          <div className="samples-grid">
            <div className="sample-card" onClick={() => loadSample('ecommerce')}>
              <h4 style={{ color: 'var(--accent-cyan)' }}>
                <ShoppingBag size={16} />
                E-Commerce Sales Raw
              </h4>
              <p style={{ marginTop: '8px' }}>
                Contains duplicate transactions, malformed emails (e.g. @@, gmial.com), and inconsistent formats of billing dates.
              </p>
            </div>

            <div className="sample-card" onClick={() => loadSample('customer')}>
              <h4 style={{ color: 'var(--accent-purple)' }}>
                <Users size={16} />
                Customer Directory Messy
              </h4>
              <p style={{ marginTop: '8px' }}>
                Contains missing birth dates, subscriber boolean variations (yes/1/true), double-spaces, and casing inconsistencies.
              </p>
            </div>

            <div className="sample-card" onClick={() => loadSample('iot')}>
              <h4 style={{ color: 'var(--accent-amber)' }}>
                <Cpu size={16} />
                IoT Sensor Telemetry Logs
              </h4>
              <p style={{ marginTop: '8px' }}>
                Simulates real-world sensor logs with missing temperatures, duplicate readings, and negative values.
              </p>
            </div>

            <div className="sample-card" onClick={loadDriftSample} style={{ border: '1px dashed var(--accent-rose)', background: 'rgba(244,63,94,0.02)' }}>
              <h4 style={{ color: 'var(--accent-rose)' }}>
                <RefreshCw size={16} />
                Simulate Schema Drift
              </h4>
              <p style={{ marginTop: '8px' }}>
                Loads customer data with altered headers: `ClientFullName` (for Customer Name) and `PaymentsVolume` (for Amount).
              </p>
            </div>

            <div className="sample-card" onClick={loadKaggleDataset}>
              <h4 style={{ color: 'var(--primary)' }}>
                <BarChart size={16} />
                Kaggle Uncleaned Student Dataset
              </h4>
              <p style={{ marginTop: '8px' }}>
                Real dataset with mixed pipe/comma formatting, spelling typos (e.g. Learnin), currency symbols, and missing fields.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
