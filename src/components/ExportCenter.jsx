import { useState } from 'react';
import { Download, Copy, Check, Database, BarChart3, LineChart, FileSpreadsheet } from 'lucide-react';
import { generatePowerQueryM, generateSQLScript, convertToCSV, convertToTSV, convertToXML, convertToYAML, convertToMarkdownTable, convertToExcelXML, runPreflightValidation } from '../utils/healingEngine';

export default function ExportCenter({ headers, rows, schema, datasetName }) {
  const [copiedType, setCopiedType] = useState(null); // 'sql', 'm', 'md'
  const preflight = runPreflightValidation(headers, rows, schema);

  // Downloads Handlers
  const downloadCSV = () => {
    const csvContent = convertToCSV(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const baseName = datasetName ? datasetName.replace(/\.[^/.]+$/, "") : 'dataset';
    link.setAttribute('download', `${baseName}_healed.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTSV = () => {
    const tsvContent = convertToTSV(headers, rows);
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const baseName = datasetName ? datasetName.replace(/\.[^/.]+$/, "") : 'dataset';
    link.setAttribute('download', `${baseName}_healed.tsv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const jsonContent = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const baseName = datasetName ? datasetName.replace(/\.[^/.]+$/, "") : 'dataset';
    link.setAttribute('download', `${baseName}_healed.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadXML = () => {
    const xmlContent = convertToXML(headers, rows);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const baseName = datasetName ? datasetName.replace(/\.[^/.]+$/, "") : 'dataset';
    link.setAttribute('download', `${baseName}_healed.xml`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadYAML = () => {
    const yamlContent = convertToYAML(headers, rows);
    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const baseName = datasetName ? datasetName.replace(/\.[^/.]+$/, "") : 'dataset';
    link.setAttribute('download', `${baseName}_healed.yaml`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    const excelContent = convertToExcelXML(headers, rows);
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const baseName = datasetName ? datasetName.replace(/\.[^/.]+$/, "") : 'dataset';
    link.setAttribute('download', `${baseName}_healed.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Generate scripts
  const baseName = datasetName ? datasetName.replace(/\.[^/.]+$/, "").replace(/[^A-Za-z0-9_]/g, '_') : 'cleaned_table';
  const sqlScript = generateSQLScript(baseName, headers, schema, rows);
  const mCode = generatePowerQueryM(headers, schema);
  const mdTable = convertToMarkdownTable(headers, rows);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Pre-flight Data Validation Suite */}
      <div className="glass-panel glow-cyan" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} color="var(--accent-cyan)" />
          Pre-Export AI Validation Safeguards
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          PowerAU tests all cleaned structures against relational BI requirements before enabling download channels.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {preflight.reports.map((rep, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem' }}>
                  {rep.status === 'Passed' ? '🟢' : rep.status === 'Warning' ? '🟡' : '🔴'}
                </span>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>{rep.test}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{rep.desc}</div>
                </div>
              </div>
              <span className={`badge ${rep.status === 'Passed' ? 'badge-emerald' : rep.status === 'Warning' ? 'badge-amber' : 'badge-rose'}`} style={{ fontSize: '0.55rem' }}>
                {rep.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 1. File Downloads Row */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
          Download Analytics-Ready Files
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-emerald" onClick={downloadCSV}>
            <Download size={16} />
            Download CSV
          </button>
          <button className="btn btn-secondary anim-pulse" onClick={downloadTSV} style={{ borderColor: 'var(--accent-emerald)' }}>
            <Download size={16} color="var(--accent-emerald)" />
            Download TSV
          </button>
          <button className="btn btn-cyan" onClick={downloadJSON}>
            <Download size={16} />
            Download JSON
          </button>
          <button className="btn btn-secondary" onClick={downloadXML} style={{ borderColor: 'var(--accent-cyan)' }}>
            <Download size={16} color="var(--accent-cyan)" />
            Download XML
          </button>
          <button className="btn btn-primary" onClick={downloadYAML}>
            <Download size={16} />
            Download YAML
          </button>
          <button className="btn btn-secondary anim-pulse" onClick={downloadExcel} style={{ borderColor: 'var(--accent-purple)', background: 'rgba(168, 85, 247, 0.05)' }}>
            <Download size={16} color="var(--accent-purple)" />
            Download Excel (XLS)
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => copyToClipboard(mdTable, 'md')}
            style={{ borderColor: 'var(--accent-purple)' }}
          >
            {copiedType === 'md' ? <Check size={16} color="var(--accent-purple)" /> : <Copy size={16} color="var(--accent-purple)" />}
            Copy Markdown Table
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
          All outputs contain fully structured, non-blank normalized fields aligned to inferred configurations.
        </p>
      </div>

      {/* 2. BI Integrations Grid */}
      <div className="bi-export-grid">
        
        {/* A. Microsoft Power BI */}
        <div className="bi-card glass-panel glow-primary">
          <div className="bi-card-header">
            <div className="bi-card-logo" style={{ background: '#f2c811', color: '#000' }}>
              <BarChart3 size={18} />
            </div>
            <div className="bi-card-title">Microsoft Power BI</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Import data using this **Power Query M-Code** to preserve schema data types automatically:
          </p>
          <div className="code-snippet-box">
            {mCode}
            <button 
              className="code-snippet-copy"
              onClick={() => copyToClipboard(mCode, 'm')}
              title="Copy M Code"
            >
              {copiedType === 'm' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 To use: Open Power BI ➔ Get Data ➔ Blank Query ➔ Advanced Editor ➔ Paste the code.
          </div>
        </div>

        {/* B. SQL Database Schema & Seed */}
        <div className="bi-card glass-panel glow-cyan">
          <div className="bi-card-header">
            <div className="bi-card-logo" style={{ background: '#336791', color: '#fff' }}>
              <Database size={18} />
            </div>
            <div className="bi-card-title">SQL Table Schema & Seed</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Run this setup script in MySQL, Postgres, SQL Server, or SQLite to build and seed your database:
          </p>
          <div className="code-snippet-box">
            {sqlScript}
            <button 
              className="code-snippet-copy"
              onClick={() => copyToClipboard(sqlScript, 'sql')}
              title="Copy SQL script"
            >
              {copiedType === 'sql' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 Creates table structure matching inferred types, then inserts cleaned values.
          </div>
        </div>

        {/* C. Tableau Schema Specifications */}
        <div className="bi-card glass-panel">
          <div className="bi-card-header">
            <div className="bi-card-logo" style={{ background: '#e97627', color: '#fff' }}>
              <LineChart size={18} />
            </div>
            <div className="bi-card-title">Tableau Desktop & Web</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Dimensions and Measures profiles mapped for Tableau workbook schemas:
          </p>
          <div className="code-snippet-box" style={{ whiteSpace: 'normal', height: '140px' }}>
            <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {headers.map(h => (
                <li key={h}>
                  <strong style={{ color: 'var(--text-primary)' }}>{h}</strong>: {
                    schema[h] === 'Integer' || schema[h] === 'Float' 
                      ? 'Continuous Measure (#)' 
                      : schema[h] === 'Date' 
                        ? 'Date Dimension (🗓️)' 
                        : 'Discrete Dimension (Abc)'
                  }
                </li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 Connect cleaned file as Text File datasource. Tableau will automatically align fields.
          </div>
        </div>

        {/* D. Looker Studio & Excel */}
        <div className="bi-card glass-panel">
          <div className="bi-card-header">
            <div className="bi-card-logo" style={{ background: '#107c41', color: '#fff' }}>
              <FileSpreadsheet size={18} />
            </div>
            <div className="bi-card-title">Excel & Looker Studio</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Connecting cleaned files to Microsoft Excel or Google Looker Studio:
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
            <div>
              <strong>Excel:</strong> Import via <code>Data ➔ From Text/CSV</code>. Set delimiter to Comma. Excel will format the ISO dates and phone numbers automatically without dropping leading zeros.
            </div>
            <div>
              <strong>Looker Studio:</strong> Upload cleaned CSV via the <code>File Upload</code> connector. Looker Studio maps <code>YYYY-MM-DD</code> columns directly as Date parameters.
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 Cleansed strings ensure zero parsing errors in Looker Google connectors.
          </div>
        </div>

      </div>
    </div>
  );
}
