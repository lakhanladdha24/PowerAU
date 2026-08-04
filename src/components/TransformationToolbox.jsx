import { useState } from 'react';
import { Sliders, PlusCircle, ArrowLeftRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TransformationToolbox({ 
  headers, 
  onAddRow, 
  onAddColumn, 
  onMoveColumn, 
  onBulkAction,
  onSmartDeduplicate
}) {
  const [activeTab, setActiveTab] = useState('columns'); // columns, rows, bulk

  // Add Column States
  const [colName, setColName] = useState('');
  const [colType, setColType] = useState('String');
  const [colDefaultVal, setColDefaultVal] = useState('');

  // Bulk Edit States
  const [bulkCol, setBulkCol] = useState(headers[0] || '');
  const [bulkAction, setBulkAction] = useState('trim');
  const [bulkFillVal, setBulkFillVal] = useState('');

  // Smart Deduplication States
  const [dedupKey, setDedupKey] = useState('all');
  const [dedupConflict, setDedupConflict] = useState('longest');

  // Handle Add Column
  const handleAddColumn = () => {
    if (!colName || colName.trim() === '') {
      alert("Please provide a column name.");
      return;
    }
    const cleanName = colName.trim().replace(/[^a-zA-Z0-9_]/g, '_');
    if (headers.includes(cleanName)) {
      alert("A column with this name already exists.");
      return;
    }
    onAddColumn(cleanName, colType, colDefaultVal);
    setColName('');
    setColDefaultVal('');
  };

  // Handle Bulk Action
  const handleBulkAction = () => {
    if (!bulkCol) return;
    onBulkAction(bulkCol, bulkAction, bulkFillVal);
    setBulkFillVal('');
  };

  return (
    <div className="glass-panel fade-in glow-cyan" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="var(--accent-cyan)" />
          Pipeline Transformation Toolbox
        </h3>
        <span className="badge badge-cyan">Schema Operations</span>
      </div>

      {/* Tabs */}
      <div className="compare-toggle-container" style={{ width: '100%' }}>
        <button 
          className={`compare-toggle-btn ${activeTab === 'columns' ? 'active' : ''}`}
          onClick={() => setActiveTab('columns')}
          style={{ flex: 1 }}
        >
          Column Tools
        </button>
        <button 
          className={`compare-toggle-btn ${activeTab === 'rows' ? 'active' : ''}`}
          onClick={() => setActiveTab('rows')}
          style={{ flex: 1 }}
        >
          Row Tools
        </button>
        <button 
          className={`compare-toggle-btn ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
          style={{ flex: 1 }}
        >
          Bulk Formatters
        </button>
      </div>

      {/* Tab 1: Column Tools */}
      {activeTab === 'columns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-in">
          {/* Add Column Section */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={14} color="var(--primary)" />
              Insert Custom Column
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '8px', marginBottom: '8px' }}>
              <input 
                type="text" 
                placeholder="Column Name" 
                className="input-field" 
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              />
              <select 
                className="input-field"
                value={colType}
                onChange={(e) => setColType(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'var(--bg-surface-elevated)' }}
              >
                <option value="String">String</option>
                <option value="Integer">Integer</option>
                <option value="Float">Float</option>
                <option value="Date">Date</option>
                <option value="Boolean">Boolean</option>
              </select>
              <input 
                type="text" 
                placeholder="Initial Value" 
                className="input-field" 
                value={colDefaultVal}
                onChange={(e) => setColDefaultVal(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={handleAddColumn}
            >
              Add New Column
            </button>
          </div>

          {/* Reorder Headers Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeftRight size={14} color="var(--accent-cyan)" />
              Reorder Column Alignments
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              {headers.map((h, index) => (
                <div 
                  key={h} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    background: 'var(--bg-surface-elevated)', 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{h}</span>
                  <button 
                    disabled={index === 0}
                    onClick={() => onMoveColumn(h, 'left')}
                    style={{ background: 'transparent', border: 'none', color: index === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: index === 0 ? 'default' : 'pointer' }}
                    title="Move Left"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    disabled={index === headers.length - 1}
                    onClick={() => onMoveColumn(h, 'right')}
                    style={{ background: 'transparent', border: 'none', color: index === headers.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: index === headers.length - 1 ? 'default' : 'pointer' }}
                    title="Move Right"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Row Tools */}
      {activeTab === 'rows' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="fade-in">
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={14} color="var(--accent-emerald)" />
              Insert Custom Row Record
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Appends an empty record row at the bottom of the data grid. You can then double-click cells inside the new row to populate values manually.
            </p>
            <button 
              className="btn btn-emerald" 
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
              onClick={onAddRow}
            >
              Add New Empty Row
            </button>
          </div>

          {/* Smart Deduplication Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--accent-purple)" />
              Smart Deduplicate & Merge
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Find repeated rows sharing the same key column. Merges column values (filling blank cells) so there is no loss of important data.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Key Matching Column</label>
                <select 
                  className="input-field" 
                  value={dedupKey} 
                  onChange={(e) => setDedupKey(e.target.value)}
                  style={{ background: 'var(--bg-surface-elevated)', padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <option value="all">Match All Columns (Exact Duplicates)</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Conflict Resolution</label>
                <select 
                  className="input-field" 
                  value={dedupConflict} 
                  onChange={(e) => setDedupConflict(e.target.value)}
                  style={{ background: 'var(--bg-surface-elevated)', padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <option value="longest">Keep Most Complete (Longest Value)</option>
                  <option value="concat">Concatenate Conflicting Values</option>
                </select>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', background: 'var(--primary-gradient)' }}
              onClick={() => onSmartDeduplicate(dedupKey, dedupConflict)}
            >
              Deduplicate & Smart Merge
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Bulk Formatters */}
      {activeTab === 'bulk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="fade-in">
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--accent-purple)" />
              Batch Transformations
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Select Column */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Column</label>
                <select 
                  className="input-field" 
                  value={bulkCol} 
                  onChange={(e) => setBulkCol(e.target.value)}
                  style={{ background: 'var(--bg-surface-elevated)', padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Select Action */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Action Rule</label>
                <select 
                  className="input-field" 
                  value={bulkAction} 
                  onChange={(e) => setBulkAction(e.target.value)}
                  style={{ background: 'var(--bg-surface-elevated)', padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <option value="trim">Trim Leading/Trailing Spaces</option>
                  <option value="upper">Convert to UPPERCASE</option>
                  <option value="lower">Convert to lowercase</option>
                  <option value="title">Convert to Title Case</option>
                  <option value="fill">Fill Blank Cells with value...</option>
                </select>
              </div>

              {/* Optional Fill Value */}
              {bulkAction === 'fill' && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Value to Fill</label>
                  <input 
                    type="text" 
                    placeholder="Enter fill value..." 
                    className="input-field" 
                    value={bulkFillVal}
                    onChange={(e) => setBulkFillVal(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  />
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', marginTop: '4px' }}
                onClick={handleBulkAction}
              >
                Apply Bulk Transform
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
