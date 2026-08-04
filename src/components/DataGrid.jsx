import { useState, useEffect, useMemo } from 'react';
import { Search, Settings2, Trash2, Check, X } from 'lucide-react';
import { classifySensitiveColumns, maskValue } from '../utils/healingEngine';

export default function DataGrid({ 
  headers, 
  rows, 
  originalRows, 
  schema, 
  changesLog, 
  showCleaned, 
  onCellEdit, 
  onColumnRename, 
  onColumnTypeChange, 
  onColumnDrop, 
  onRowDelete,
  onColumnSplit,
  onColumnsMerge,
  maskSensitiveData
}) {
  const colClassifications = useMemo(() => {
    return classifySensitiveColumns(headers || [], rows || []);
  }, [headers, rows]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, header }
  const [editValue, setEditValue] = useState('');

  // Simulated real-time pipeline telemetry diagnostics
  const [latency, setLatency] = useState(1.4); // ms
  const [heapSize, setHeapSize] = useState(24.4); // MB
  const [isGCRunning, setIsGCRunning] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);

  // Trigger simulated garbage collection visual when mutations happen
  useEffect(() => {
    if (changesLog.length > 0) {
      Promise.resolve().then(() => {
        setIsGCRunning(true);
      });
      const startLatency = performance.now();
      const timer = setTimeout(() => {
        setIsGCRunning(false);
        const endLatency = performance.now();
        setLatency(Math.max(0.6, Math.round((endLatency - startLatency) * 10) / 10));
        setHeapSize(Math.max(10.2, Math.round((26.5 - Math.random() * 6) * 10) / 10));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [changesLog.length]);
  
  // Column Management Modal State
  const [selectedCol, setSelectedCol] = useState(null); // header string
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState('');

  // Split / Merge States
  const [splitDelimiter, setSplitDelimiter] = useState(' ');
  const [mergeSelectedCols, setMergeSelectedCols] = useState([]);
  const [mergeSeparator, setMergeSeparator] = useState(' ');
  const [mergeTargetName, setMergeTargetName] = useState('merged_column');

  // Search Filter
  const filteredRows = useMemo(() => {
    const list = rows || [];
    return list.filter(row => {
      return (headers || []).some(h => {
        const val = row[h];
        return val !== undefined && val !== null && val.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [rows, headers, searchQuery]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100); // Increased page size to 100 rows

  // Reset page when search or rows change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchQuery, rows?.length]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Cell Editing
  const startEditing = (rowIndex, header, val) => {
    setEditingCell({ rowIndex, header });
    setEditValue(val !== undefined && val !== null ? String(val) : '');
  };

  const saveCellEdit = () => {
    if (editingCell) {
      onCellEdit(editingCell.rowIndex, editingCell.header, editValue);
      setEditingCell(null);
    }
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
  };

  // Pre-index originalRows for O(1) lookups
  const originalRowsMap = useMemo(() => {
    const map = new Map();
    const list = originalRows || [];
    list.forEach(row => {
      if (row && row.id !== undefined) {
        map.set(row.id, row);
      }
    });
    return map;
  }, [originalRows]);

  // Pre-index changesLog for O(1) cell lookups
  const changesLookup = useMemo(() => {
    const map = new Map();
    changesLog.forEach(c => {
      map.set(`${c.row}_${c.column}`, c);
    });
    return map;
  }, [changesLog]);

  // Check if a cell was auto-healed in O(1)
  const getCellHealInfo = (rowId, header) => {
    return changesLookup.get(`${rowId}_${header}`) || changesLookup.get(`${rowId}_All`);
  };

  // Open Column Options Modal
  const openColOptions = (h) => {
    setSelectedCol(h);
    setNewColName(h);
    setNewColType(schema[h] || 'String');
    setMergeSelectedCols([]);
    setMergeTargetName(`${h}_merged`);
  };

  const saveColOptions = () => {
    if (newColName !== selectedCol) {
      onColumnRename(selectedCol, newColName);
    }
    if (newColType !== schema[selectedCol]) {
      onColumnTypeChange(newColName, newColType);
    }
    setSelectedCol(null);
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Table Controls */}
      <div className="grid-controls">
        <div className="grid-search">
          <Search size={16} className="grid-search-icon" />
          <input 
            type="text" 
            placeholder="Search rows in grid..." 
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setShowTelemetry(!showTelemetry)} 
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', height: '30px' }}
          >
            {showTelemetry ? '📊 Hide Diagnostics' : '📊 Show Diagnostics'}
          </button>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {filteredRows.length} of {(rows || []).length} rows
          </div>
        </div>
      </div>

      {/* Pipeline Telemetry Diagnostics Panel */}
      {showTelemetry && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '0.75rem' }} className="fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Render Latency (React)</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: latency > 3 ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
              ⚡ {latency} ms
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Heap Space Footprint</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-purple)' }}>
              💾 {heapSize} MB / 512 MB
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pipeline Engine Throughput</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              🚀 {Math.round((rows || []).length / (latency / 1000 || 1)).toLocaleString()} rows/sec
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>DataOS Engine Health</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`bullet-active ${isGCRunning ? 'anim-pulse' : ''}`} style={{ background: isGCRunning ? 'var(--accent-rose)' : 'var(--accent-emerald)', boxShadow: isGCRunning ? '0 0 8px var(--accent-rose)' : '0 0 8px var(--accent-emerald)' }} />
              <span style={{ fontWeight: '700', color: isGCRunning ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                {isGCRunning ? 'MEM_GC_RUNNING (Purge Cells)' : 'ENGINE_HEALTH_OK'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Scrollable Data Grid */}
      <div className="data-table-container" style={{ maxHeight: '420px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Row</th>
              {headers.map(h => {
                const isPII = colClassifications[h] && colClassifications[h].startsWith('PII');
                const isFinance = colClassifications[h] === 'Financial Data';
                return (
                  <th key={h} style={{ minWidth: '220px' }}>
                    <div className="column-header-menu">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          {h}
                          {isPII && <span style={{ color: 'var(--accent-rose)', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '1px 4px', background: 'rgba(244,63,94,0.1)', borderRadius: '4px', border: '1px solid rgba(244,63,94,0.2)' }} title={colClassifications[h]}>🛡️ PII</span>}
                          {isFinance && <span style={{ color: 'var(--accent-amber)', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '1px 4px', background: 'rgba(245,158,11,0.1)', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.2)' }} title="Financial Sensitive">💳 Fin</span>}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                          {schema[h] || 'String'}
                        </span>
                      </div>
                      <button 
                        className="column-action-btn"
                        onClick={() => openColOptions(h)}
                        title="Column Settings"
                      >
                        <Settings2 size={12} />
                      </button>
                    </div>
                  </th>
                );
              })}
              <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row) => {
              const originalRow = originalRowsMap.get(row.id) || row;
              const rIdx = Array.isArray(rows) ? rows.findIndex(r => r.id === row.id) : -1;
              
              return (
                <tr 
                  key={row.id} 
                  style={{ 
                    background: row._isDuplicate ? 'rgba(244, 63, 94, 0.04)' : 'none', 
                    borderLeft: row._isDuplicate ? '3px solid var(--accent-rose)' : 'none' 
                  }}
                >
                  <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>
                    {row.id}
                  </td>
                  {headers.map(h => {
                    const cellVal = row[h];
                    const origVal = originalRow[h];
                    
                    const healInfo = getCellHealInfo(row.id, h);
                    const isCellEdited = editingCell && editingCell.rowIndex === rIdx && editingCell.header === h;
                    
                    let tdClass = '';
                    if (showCleaned && healInfo) {
                      tdClass = 'healed-cell';
                    } else if (!showCleaned && origVal !== cellVal && healInfo) {
                      tdClass = 'original-cell-highlight';
                    }

                    return (
                      <td 
                        key={h} 
                        className={tdClass}
                        onDoubleClick={() => startEditing(rIdx, h, cellVal)}
                        style={{ position: 'relative', minWidth: '220px' }}
                      >
                        {isCellEdited ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input 
                              type="text" 
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)}
                              className="input-field"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: '100px' }}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveCellEdit();
                                if (e.key === 'Escape') cancelCellEdit();
                              }}
                            />
                            <button onClick={saveCellEdit} style={{ background: 'var(--accent-emerald)', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#fff' }}>
                              <Check size={12} />
                            </button>
                            <button onClick={cancelCellEdit} style={{ background: 'var(--accent-rose)', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#fff' }}>
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            {maskSensitiveData && colClassifications[h] && colClassifications[h] !== 'Public' ? (
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                {maskValue(showCleaned ? cellVal : origVal, colClassifications[h])}
                              </span>
                            ) : (
                              showCleaned ? String(cellVal) : String(origVal)
                            )}
                            {showCleaned && healInfo && (
                              <span className="healed-cell-tooltip">
                                Original: {origVal === '' ? '[BLANK]' : String(origVal)} ➔ {healInfo.type}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }}>
                    {row._isDuplicate ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(244,63,94,0.06)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(244,63,94,0.15)', minWidth: '120px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontWeight: '700', textAlign: 'center', whiteSpace: 'normal' }}>
                          Duplicate Row! Delete?
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => onRowDelete(row.id)}
                            style={{ 
                              background: 'var(--accent-rose)', 
                              border: 'none', 
                              borderRadius: '4px', 
                              padding: '2px 8px', 
                              cursor: 'pointer', 
                              color: '#fff', 
                              fontSize: '0.65rem',
                              fontWeight: '600'
                            }}
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => onCellEdit(rIdx, '_isDuplicate', false)}
                            style={{ 
                              background: 'var(--bg-surface-elevated)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '4px', 
                              padding: '2px 8px', 
                              cursor: 'pointer', 
                              color: 'var(--text-primary)', 
                              fontSize: '0.65rem',
                              fontWeight: '600'
                            }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="column-action-btn"
                        style={{ color: 'var(--accent-rose)' }}
                        onClick={() => onRowDelete(row.id)}
                        title="Delete Row"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', padding: '10px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div>
          Showing {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(filteredRows.length, currentPage * pageSize)} of {filteredRows.length} items
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span>Page <strong>{currentPage}</strong> of <strong>{Math.ceil(filteredRows.length / pageSize) || 1}</strong></span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredRows.length / pageSize), p + 1))}
            disabled={currentPage >= Math.ceil(filteredRows.length / pageSize)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px', opacity: currentPage >= Math.ceil(filteredRows.length / pageSize) ? 0.5 : 1, cursor: currentPage >= Math.ceil(filteredRows.length / pageSize) ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
        <span>💡 Double-click any cell to manually edit values.</span>
        <span>🔧 Click Settings next to column headers to cast types, rename, split, merge, or drop.</span>
      </div>

      {/* Column Operations Modal (Renames, Cast Types, Split, Merge, Drop) */}
      {selectedCol && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '500px' }}>
            <div className="modal-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings2 size={18} color="var(--primary)" />
                Column Settings: {selectedCol}
              </h4>
              <button 
                className="column-action-btn" 
                onClick={() => setSelectedCol(null)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
              {/* Type and Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Rename Column
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newColName} 
                    onChange={(e) => setNewColName(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Data Type Casting
                  </label>
                  <select 
                    className="input-field"
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value)}
                    style={{ background: 'var(--bg-surface-elevated)' }}
                  >
                    <option value="String">String (Text)</option>
                    <option value="Integer">Integer (Whole Number)</option>
                    <option value="Float">Float (Decimal Number)</option>
                    <option value="Date">Date (ISO 8601)</option>
                    <option value="Email">Email Address</option>
                    <option value="Phone">Phone Number</option>
                    <option value="Boolean">Boolean (True/False)</option>
                  </select>
                </div>
              </div>

              {/* Split Column */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Split Column values
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Delimiter character (e.g. space, comma)"
                    className="input-field" 
                    value={splitDelimiter} 
                    onChange={(e) => setSplitDelimiter(e.target.value)} 
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                  />
                  <button 
                    className="btn btn-cyan" 
                    style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                    onClick={() => {
                      onColumnSplit(selectedCol, splitDelimiter);
                      setSelectedCol(null);
                    }}
                  >
                    Split
                  </button>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Separates text values into distinct new columns (e.g., Name ➔ Name_split_1, Name_split_2).
                </span>
              </div>

              {/* Merge Column */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Merge with other columns
                </label>
                <div style={{ maxHeight: '80px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {headers.filter(h => h !== selectedCol).map(h => (
                    <label key={h} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={mergeSelectedCols.includes(h)} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMergeSelectedCols([...mergeSelectedCols, h]);
                          } else {
                            setMergeSelectedCols(mergeSelectedCols.filter(item => item !== h));
                          }
                        }}
                      />
                      {h}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Joiner (e.g. space, comma)"
                    className="input-field" 
                    value={mergeSeparator} 
                    onChange={(e) => setMergeSeparator(e.target.value)} 
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Merged column name"
                    className="input-field" 
                    value={mergeTargetName} 
                    onChange={(e) => setMergeTargetName(e.target.value)} 
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem' }}
                  disabled={mergeSelectedCols.length === 0}
                  onClick={() => {
                    onColumnsMerge([selectedCol, ...mergeSelectedCols], mergeSeparator, mergeTargetName);
                    setSelectedCol(null);
                  }}
                >
                  Merge selected columns
                </button>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                className="btn btn-rose" 
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                onClick={() => {
                  onColumnDrop(selectedCol);
                  setSelectedCol(null);
                }}
              >
                <Trash2 size={14} /> Drop Column
              </button>
              <div className="modal-footer" style={{ gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  onClick={() => setSelectedCol(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  onClick={saveColOptions}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
