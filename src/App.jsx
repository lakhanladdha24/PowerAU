import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Cpu, Sparkles, BarChart3, Sliders, TrendingUp, Users, Activity, Download, FileText, Layout, Shield, Network, X, Plus } from 'lucide-react';
import './App.css';
import Dashboard from './components/Dashboard';
import VisualPipeline from './components/VisualPipeline';
import DataAuditor from './components/DataAuditor';
import DataGrid from './components/DataGrid';
import TransformationToolbox from './components/TransformationToolbox';
import ExportCenter from './components/ExportCenter';
import PipelineBacktester from './components/PipelineBacktester';

// New Features Imports
import SmartDashboard from './components/SmartDashboard';
import AICopilot from './components/AICopilot';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import CollaborationWorkspace from './components/CollaborationWorkspace';
import AuditLineage from './components/AuditLineage';
import ReportGenerator from './components/ReportGenerator';

// PowerAU Core Views
import MultiAgentConsole from './components/MultiAgentConsole';
import BusinessSimulator from './components/BusinessSimulator';
import RootCauseAnalyzer from './components/RootCauseAnalyzer';
import SemanticOntology from './components/SemanticOntology';
import AskWorkspace from './components/AskWorkspace';
import RealTimeAnalytics from '../realtime/RealTimeAnalytics';

import { 
  parseFileContent,
  inferSchema, 
  auditData, 
  healData, 
  splitColumn, 
  mergeColumns, 
  smartDeduplicate,
  inferBusinessContext,
  detectAndMapSchemaDrift
} from './utils/healingEngine';
import { useDataStore } from './utils/dataStore';

function App() {
  // Centralized DataOS Store (Industry-Level Versioning Engine)
  const {
    datasetName,
    rawContent,
    headers,
    rows,
    originalRows,
    schema,
    context,
    anomalies,
    columnMetrics,
    globalQualityScore,
    originalQualityScore,
    changesLog,
    duplicateCount,
    activeBranch,
    branchesList,
    commitHistory,
    updateState,
    commit,
    createBranch,
    checkoutBranch,
    rollback
  } = useDataStore();

  // Adapter functions to preserve compatibility with existing layout mutations
  const setDatasetName = useCallback((val) => updateState({ datasetName: val }), [updateState]);
  const setRawContent = useCallback((val) => updateState({ rawContent: val }), [updateState]);
  const setHeaders = useCallback((val) => updateState({ headers: val }), [updateState]);
  const setRows = useCallback((val) => updateState({ rows: val }), [updateState]);
  const setOriginalRows = useCallback((val) => updateState({ originalRows: val }), [updateState]);
  const setSchema = useCallback((val) => updateState({ schema: val }), [updateState]);
  const setContext = useCallback((val) => updateState({ context: val }), [updateState]);
  const setAnomalies = useCallback((val) => updateState({ anomalies: val }), [updateState]);
  const setColumnMetrics = useCallback((val) => updateState({ columnMetrics: val }), [updateState]);
  const setGlobalQualityScore = useCallback((val) => updateState({ globalQualityScore: val }), [updateState]);
  const setOriginalQualityScore = useCallback((val) => updateState({ originalQualityScore: val }), [updateState]);
  const setChangesLog = useCallback((val) => updateState({ changesLog: val }), [updateState]);
  const setDuplicateCount = useCallback((val) => updateState({ duplicateCount: val }), [updateState]);

  const [filteredRows, setFilteredRows] = useState([]); // In sync with copilot query filters

  // Guided Lifecycle States
  const [isGuidedMode, setIsGuidedMode] = useState(false); // false = direct mode landing, true = guided 6-stage project mode
  const [currentStage, setCurrentStage] = useState('collect'); // default landing page is collect (uploader)
  const [unlockedStages, setUnlockedStages] = useState(['collect']);
  const [projectGoal, setProjectGoal] = useState(null); // { goalName, kpis, expectedColumns, models, rawProblem }
  
  // Sub-navigation tabs within stages
  const [analyzeTab, setAnalyzeTab] = useState('dashboards'); // dashboards, simulator, diagnostics, predictive, agents
  const [presentTab, setPresentTab] = useState('presentation'); // presentation, export, collab
  const [activeTab, setActiveTab] = useState('dashboards'); // dashboards, grid, agents, simulator, diagnostics, predictive, collab, lineage, presentation, export (direct flat tabs)
  const [workflowMode, setWorkflowMode] = useState('historical'); // historical or realtime

  // UI Flow States
  const [showCleaned, setShowCleaned] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [delimiter, setDelimiter] = useState('auto'); // auto, comma, semicolon, tab, pipe
  const [imputeNumeric, setImputeNumeric] = useState('mean'); // mean, median, mode
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // PowerAU Core States
  const [maskSensitiveData, setMaskSensitiveData] = useState(false);
  const [remappings, setRemappings] = useState([]);
  const [hasSchemaDrift, setHasSchemaDrift] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Time-Based Theme States & Synchronizer
  const getThemeFromTime = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return 'dawn';
    if (hour >= 9 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'midnight';
  };

  const [theme, setTheme] = useState(getThemeFromTime());
  const [isAutoTheme, setIsAutoTheme] = useState(true);

  // Sync theme class to documentElement
  React.useEffect(() => {
    document.documentElement.classList.remove('theme-dawn', 'theme-day', 'theme-dusk', 'theme-midnight');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  React.useEffect(() => {
    let intervalId = null;
    if (isAutoTheme) {
      intervalId = setInterval(() => {
        setTheme(getThemeFromTime());
      }, 30000); // Check every 30 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoTheme]);

  // 1. Process dataset upload or sandbox click
  const handleDatasetLoad = (name, text, currentDelimiter = delimiter, currentImpute = imputeNumeric) => {
    setIsProcessing(true);
    setDatasetName(name);
    setRawContent(text);
    
    // Parse raw text based on file format/extension
    const { headers: parsedHeaders, rows: parsedRows } = parseFileContent(name, text, currentDelimiter);
    
    // Run AI Schema Drift remapping
    const driftResult = detectAndMapSchemaDrift(parsedHeaders, parsedRows);
    const hasDrift = driftResult.remappings.length > 0;
    setHasSchemaDrift(hasDrift);
    setRemappings(driftResult.remappings);

    const finalHeaders = driftResult.headers;
    const finalRows = driftResult.rows;

    // Schema type inference
    const inferredSchema = inferSchema(finalHeaders, finalRows);
    
    // Run anomaly audit on raw records
    const auditResults = auditData(finalHeaders, finalRows, inferredSchema);
    
    // Run self-healing rules (incorporates swapped column and merged column splits)
    const { healedRows, changes, duplicateCount: dups } = healData(finalHeaders, finalRows, inferredSchema, { imputeNumeric: currentImpute });

    // Prepend drift corrections to changes log
    const finalChanges = [...changes];
    if (hasDrift) {
      driftResult.remappings.forEach(remap => {
        finalChanges.unshift({
          row: 'All',
          column: remap.newHeader,
          type: 'Schema Drift Corrected',
          oldValue: remap.oldHeader,
          newValue: remap.newHeader,
          description: `AI semantically remapped drifted column header '${remap.oldHeader}' ➔ '${remap.newHeader}' to preserve KPI model logic.`
        });
      });
    }

    // Infer business context domain
    const bizContext = inferBusinessContext(finalHeaders, healedRows);
    setContext(bizContext);

    // Save states
    setHeaders(finalHeaders);
    setOriginalRows(finalRows);
    setRows(healedRows);
    setFilteredRows(healedRows);
    setSchema(inferredSchema);
    setAnomalies(auditResults.anomalies);
    setColumnMetrics(auditResults.columnMetrics);
    
    // Track quality score improvement
    setOriginalQualityScore(auditResults.globalQualityScore);
    setDuplicateCount(dups);
    setChangesLog(finalChanges);
    
    // Re-calculate the healed quality score
    const healedAudit = auditData(finalHeaders, healedRows, inferredSchema);
    setGlobalQualityScore(healedAudit.globalQualityScore);

    // Set a default goal if none exists yet
    if (!projectGoal) {
      setProjectGoal({
        goalName: `Exploratory Analysis of ${name}`,
        kpis: ["Total Record Volume", "Completeness Rate", "Anomaly Index"],
        expectedColumns: finalHeaders,
        models: ["Descriptive Summary Statistics", "Isolation Forest Outlier Detection"],
        rawProblem: `Imported local dataset: ${name}`
      });
    }

    if (isGuidedMode) {
      setUnlockedStages(['ask', 'collect', 'investigate', 'prepare', 'analyze', 'present']);
      setCurrentStage('investigate');
    } else {
      setUnlockedStages(['collect']);
      setCurrentStage('collect');
      setActiveTab('dashboards');
    }
    setIsProcessing(false);
  };

  // Helper to sync modified rows with active filter states
  const updateRowsState = useCallback((updatedRows, newHeaders = headers, newSchema = schema, appendedChanges = []) => {
    setRows(updatedRows);
    setFilteredRows(updatedRows);
    
    const auditResults = auditData(newHeaders, updatedRows, newSchema);
    setAnomalies(auditResults.anomalies);
    setColumnMetrics(auditResults.columnMetrics);
    setGlobalQualityScore(auditResults.globalQualityScore);
    
    if (appendedChanges.length > 0) {
      setChangesLog(prev => [...prev, ...appendedChanges]);
    }
  }, [headers, schema, setRows, setFilteredRows, setAnomalies, setColumnMetrics, setGlobalQualityScore, setChangesLog]);

  // Update filtered rows when copilot filters data
  const handleFilterDataset = (newFilteredRows) => {
    setFilteredRows(newFilteredRows);
  };

  // Reset filters to full healed dataset
  const handleResetFilters = () => {
    setFilteredRows(rows);
  };

  // Handle delimiter override on active dataset
  const handleDelimiterChange = (newDelimiter) => {
    setDelimiter(newDelimiter);
    if (rawContent) {
      handleDatasetLoad(datasetName, rawContent, newDelimiter, imputeNumeric);
    }
  };

  // Handle numeric imputation strategy override on active dataset
  const handleImputeNumericChange = (newImputeStrategy) => {
    setImputeNumeric(newImputeStrategy);
    if (rawContent) {
      handleDatasetLoad(datasetName, rawContent, delimiter, newImputeStrategy);
    }
  };

  const handleSetProjectGoal = (goal) => {
    setProjectGoal(goal);
    setUnlockedStages(['ask', 'collect']);
    setCurrentStage('collect');
  };

  // 2. Clear states for new file ingestion
  const handleReset = () => {
    setDatasetName('');
    setRawContent('');
    setHeaders([]);
    setRows([]);
    setFilteredRows([]);
    setOriginalRows([]);
    setSchema({});
    setContext('general');
    setAnomalies([]);
    setColumnMetrics({});
    setGlobalQualityScore(0);
    setOriginalQualityScore(0);
    setChangesLog([]);
    setDuplicateCount(0);
    setShowCleaned(true);
    setDelimiter('auto');
    setImputeNumeric('mean');
    setMaskSensitiveData(false);
    setRemappings([]);
    setHasSchemaDrift(false);
    setIsStreamingActive(false);
    setProjectGoal(null);
    setIsGuidedMode(false);
    setCurrentStage('collect');
    setUnlockedStages(['collect']);
    setAnalyzeTab('dashboards');
    setPresentTab('presentation');
    setActiveTab('dashboards');
  };

  // Live Streaming Data Simulation loop
  useEffect(() => {
    let intervalId = null;
    if (isStreamingActive && datasetName) {
      intervalId = setInterval(() => {
        // Generate a new row with random values based on headers and schema
        const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        const newRow = { id: nextId };
        
        headers.forEach(h => {
          const type = schema[h];
          if (type === 'Integer') {
            newRow[h] = Math.floor(Math.random() * 45) + 18; // age or similar
          } else if (type === 'Float' || type === 'Currency') {
            newRow[h] = (Math.random() * 200 + 20).toFixed(2);
          } else if (type === 'Date') {
            const date = new Date();
            newRow[h] = date.toISOString().split('T')[0];
          } else if (type === 'Email') {
            newRow[h] = `stream.user_${nextId}@powerau.ai`;
          } else if (type === 'Phone') {
            newRow[h] = `+1 (555) 019-${Math.floor(1000 + Math.random() * 9000)}`;
          } else if (type === 'Boolean') {
            newRow[h] = Math.random() > 0.3 ? 'true' : 'false';
          } else {
            // String category
            if (h.toLowerCase().includes('course') || h.toLowerCase().includes('product')) {
              const categories = ['Machine Learning', 'Data Science', 'Data Engineering', 'Business Strategy', 'Analytics Copilot'];
              newRow[h] = categories[Math.floor(Math.random() * categories.length)];
            } else if (h.toLowerCase().includes('status')) {
              newRow[h] = Math.random() > 0.2 ? 'delivered' : 'pending';
            } else {
              newRow[h] = `StreamData_${nextId}`;
            }
          }
        });

        const updatedRows = [...rows, newRow];
        const updatedOrig = [...originalRows, newRow];
        setOriginalRows(updatedOrig);

        const changeEntry = {
          row: nextId,
          column: 'All',
          type: 'Live Stream Ingestion',
          oldValue: 'Stream Event',
          newValue: `Ingested Event #${nextId}`,
          description: 'Streaming socket event appended and audited in real-time.'
        };

        updateRowsState(updatedRows, headers, schema, [changeEntry]);
      }, 3000); // every 3 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStreamingActive, rows, originalRows, headers, schema, datasetName, setOriginalRows, updateRowsState]);

  // 3. User manually edits a cell in the table
  const handleCellEdit = (rowIndex, header, newValue) => {
    const updatedRows = [...rows];
    const oldVal = updatedRows[rowIndex][header];
    
    updatedRows[rowIndex][header] = newValue;

    const rowId = updatedRows[rowIndex].id;
    const changeEntry = {
      row: rowId,
      column: header,
      type: 'Manual Edit',
      oldValue: String(oldVal),
      newValue: String(newValue),
      description: 'Manually modified value via Data Grid override.'
    };

    updateRowsState(updatedRows, headers, schema, [changeEntry]);
  };

  // 4. Rename column header
  const handleColumnRename = (oldName, newName) => {
    if (!newName || newName.trim() === '' || oldName === newName) return;

    const newHeaders = headers.map(h => h === oldName ? newName : h);
    setHeaders(newHeaders);

    const updateKeys = (rowList) => {
      return rowList.map(row => {
        const newRow = { ...row };
        newRow[newName] = newRow[oldName];
        delete newRow[oldName];
        return newRow;
      });
    };

    const newRows = updateKeys(rows);
    const newOriginalRows = updateKeys(originalRows);
    setOriginalRows(newOriginalRows);

    const newSchema = { ...schema };
    newSchema[newName] = newSchema[oldName];
    delete newSchema[oldName];
    setSchema(newSchema);

    const newChanges = changesLog.map(c => {
      if (c.column === oldName) {
        return { ...c, column: newName };
      }
      return c;
    });
    setChangesLog(newChanges);

    updateRowsState(newRows, newHeaders, newSchema);
  };

  // 5. Change column type casting & re-run cleaning
  const handleColumnTypeChange = (columnName, newType) => {
    const updatedSchema = { ...schema, [columnName]: newType };
    setSchema(updatedSchema);

    const { healedRows, changes } = healData(headers, originalRows, updatedSchema, { imputeNumeric });
    updateRowsState(healedRows, headers, updatedSchema);
    setChangesLog(changes);
  };

  // 6. Delete column
  const handleColumnDrop = (columnName) => {
    const newHeaders = headers.filter(h => h !== columnName);
    setHeaders(newHeaders);

    const dropKey = (rowList) => {
      return rowList.map(row => {
        const newRow = { ...row };
        delete newRow[columnName];
        return newRow;
      });
    };

    const newRows = dropKey(rows);
    const newOriginalRows = dropKey(originalRows);
    setOriginalRows(newOriginalRows);

    const newSchema = { ...schema };
    delete newSchema[columnName];
    setSchema(newSchema);

    const newChanges = changesLog.filter(c => c.column !== columnName);
    setChangesLog(newChanges);

    updateRowsState(newRows, newHeaders, newSchema);
  };

  // 7. Delete row
  const handleRowDelete = (rowId) => {
    const newRows = rows.filter(r => r.id !== rowId);
    const newOriginalRows = originalRows.filter(r => r.id !== rowId);
    setOriginalRows(newOriginalRows);
    updateRowsState(newRows, headers, schema);
  };

  // 8. Column Split operation callback
  const handleColumnSplit = (columnName, splitDelim) => {
    const splitResult = splitColumn(headers, rows, columnName, splitDelim);
    const splitOrigResult = splitColumn(headers, originalRows, columnName, splitDelim);

    setHeaders(splitResult.headers);
    setOriginalRows(splitOrigResult.rows);

    const newSchema = { ...schema };
    delete newSchema[columnName];
    splitResult.newCols.forEach(newCol => {
      newSchema[newCol] = 'String';
    });
    setSchema(newSchema);

    const logEntries = splitResult.newCols.map(newCol => ({
      row: 'All',
      column: newCol,
      type: 'Split Column Created',
      oldValue: `Extracted from ${columnName}`,
      newValue: 'Split data values',
      description: `Split column '${columnName}' by delimiter '${splitDelim}' to create '${newCol}'.`
    }));

    updateRowsState(splitResult.rows, splitResult.headers, newSchema, logEntries);
  };

  // 9. Columns Merge operation callback
  const handleColumnsMerge = (columnNames, separator, targetName) => {
    const mergeResult = mergeColumns(headers, rows, columnNames, separator, targetName);
    const mergeOrigResult = mergeColumns(headers, originalRows, columnNames, separator, targetName);

    setHeaders(mergeResult.headers);
    setOriginalRows(mergeOrigResult.rows);

    const newSchema = { ...schema };
    columnNames.forEach(name => {
      delete newSchema[name];
    });
    newSchema[targetName] = 'String';
    setSchema(newSchema);

    const logEntry = {
      row: 'All',
      column: targetName,
      type: 'Merged Column Created',
      oldValue: `Combined fields: [${columnNames.join(', ')}]`,
      newValue: 'Merged string values',
      description: `Merged fields [${columnNames.join(', ')}] with separator '${separator}' into '${targetName}'.`
    };

    updateRowsState(mergeResult.rows, mergeResult.headers, newSchema, [logEntry]);
  };

  // ==========================================
  // TRANSFORM TOOLBOX CALLBACKS
  // ==========================================

  // A. Add Custom Empty Row
  const handleAddRow = () => {
    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const newRow = { id: nextId };
    headers.forEach(h => {
      newRow[h] = '';
    });

    const updatedRows = [...rows, newRow];
    const updatedOrigRows = [...originalRows, newRow];
    setOriginalRows(updatedOrigRows);

    const logEntry = {
      row: nextId,
      column: 'All',
      type: 'Inserted Empty Row',
      oldValue: '',
      newValue: `Created Row #${nextId}`,
      description: `Appended a new empty record to the end of the dataset.`
    };

    updateRowsState(updatedRows, headers, schema, [logEntry]);
  };

  // B. Add New Custom Column
  const handleAddColumn = (colName, colType, defaultVal) => {
    const updatedHeaders = [...headers, colName];
    setHeaders(updatedHeaders);

    const insertCol = (rowList) => {
      return rowList.map(row => ({
        ...row,
        [colName]: defaultVal
      }));
    };

    const updatedRows = insertCol(rows);
    const updatedOrigRows = insertCol(originalRows);
    setOriginalRows(updatedOrigRows);

    const updatedSchema = { ...schema, [colName]: colType };
    setSchema(updatedSchema);

    const logEntry = {
      row: 'All',
      column: colName,
      type: 'Column Created',
      oldValue: '',
      newValue: String(defaultVal || '[BLANK]'),
      description: `Added column '${colName}' of type '${colType}' initialized with '${defaultVal || '[BLANK]'}'.`
    };

    updateRowsState(updatedRows, updatedHeaders, updatedSchema, [logEntry]);
  };

  // C. Move Column (header reordering)
  const handleMoveColumn = (columnName, direction) => {
    const colIndex = headers.indexOf(columnName);
    if (colIndex === -1) return;

    const newHeaders = [...headers];
    if (direction === 'left' && colIndex > 0) {
      newHeaders[colIndex] = newHeaders[colIndex - 1];
      newHeaders[colIndex - 1] = columnName;
    } else if (direction === 'right' && colIndex < headers.length - 1) {
      newHeaders[colIndex] = newHeaders[colIndex + 1];
      newHeaders[colIndex + 1] = columnName;
    } else {
      return;
    }

    setHeaders(newHeaders);

    const logEntry = {
      row: 'All',
      column: columnName,
      type: 'Column Alignment Reordered',
      oldValue: `Position ${colIndex + 1}`,
      newValue: `Position ${newHeaders.indexOf(columnName) + 1}`,
      description: `Shifted column header position in output schema table.`
    };

    setChangesLog(prev => [...prev, logEntry]);
  };

  // D. Bulk Column Formatter Actions
  const handleBulkAction = (columnName, actionType, optionalValue) => {
    let affectedCount = 0;
    const updatedRows = rows.map(row => {
      const newRow = { ...row };
      const val = String(row[columnName] || '');
      let newVal = val;

      if (actionType === 'trim') {
        newVal = val.trim().replace(/\s+/g, ' ');
      } else if (actionType === 'upper') {
        newVal = val.toUpperCase();
      } else if (actionType === 'lower') {
        newVal = val.toLowerCase();
      } else if (actionType === 'title') {
        newVal = val.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      } else if (actionType === 'fill') {
        if (val === '' || val === 'N/A' || val === 'Unknown') {
          newVal = optionalValue;
        }
      }

      if (newVal !== val) {
        newRow[columnName] = newVal;
        affectedCount++;
      }
      return newRow;
    });

    if (affectedCount === 0) {
      alert("No rows were modified by this bulk action.");
      return;
    }

    const logEntry = {
      row: 'All',
      column: columnName,
      type: 'Bulk Action Applied',
      oldValue: `${actionType} operation`,
      newValue: `Modified ${affectedCount} cells`,
      description: `Executed bulk transform: '${actionType}' across all records for column '${columnName}'.`
    };

    updateRowsState(updatedRows, headers, schema, [logEntry]);
  };

  // E. Smart Deduplicate & Merge
  const handleSmartDeduplicate = (keyColumn, conflictResolution) => {
    const { mergedRows, changes } = smartDeduplicate(headers, rows, keyColumn, conflictResolution);
    
    if (changes.length === 0) {
      alert("No repeated data was found based on the selected key column.");
      return;
    }

    const remainingIds = new Set(mergedRows.map(r => r.id));
    const newOriginalRows = originalRows.filter(r => remainingIds.has(r.id));
    setOriginalRows(newOriginalRows);

    updateRowsState(mergedRows, headers, schema, changes);
  };

  return (
    <div className="app-container">
      {/* A. Platform Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Cpu size={24} color="#fff" />
          </div>
          <div>
            <h1 className="logo-text">PowerAU</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '-4px', fontWeight: '600' }}>
              Autonomous BI & Data Intelligence Operating System
            </p>
          </div>
        </div>

        {/* Workflow Mode Selector Tab buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', marginLeft: '24px' }}>
          <button 
            onClick={() => setWorkflowMode('historical')}
            className={`btn ${workflowMode === 'historical' ? 'active' : ''}`}
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.75rem', 
              borderRadius: '6px', 
              height: '28px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: workflowMode === 'historical' ? 'var(--primary-gradient)' : 'transparent',
              color: workflowMode === 'historical' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Historical Ingest
          </button>
          <button 
            onClick={() => setWorkflowMode('realtime')}
            className={`btn ${workflowMode === 'realtime' ? 'active' : ''}`}
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.75rem', 
              borderRadius: '6px', 
              height: '28px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: workflowMode === 'realtime' ? 'var(--primary-gradient)' : 'transparent',
              color: workflowMode === 'realtime' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Real-Time Analytics
          </button>
        </div>
                
        <div className="header-meta" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Time-based Theme Dynamic Controller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Theme:</span>
            <select 
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                setIsAutoTheme(false); // disable auto-sync when manually overridden
              }}
              className="input-field"
              style={{ width: '105px', padding: '2px 6px', fontSize: '0.75rem', height: '24px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <option value="dawn">🌅 Dawn</option>
              <option value="day">☀️ Daylight</option>
              <option value="dusk">🌇 Dusk</option>
              <option value="midnight">🌙 Midnight</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: isAutoTheme ? 'var(--accent-cyan)' : 'var(--text-muted)', userSelect: 'none' }} title="Sync automatically to local hour">
              <input 
                type="checkbox" 
                checked={isAutoTheme}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsAutoTheme(checked);
                  if (checked) {
                    setTheme(getThemeFromTime());
                  }
                }}
                style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem' }}>Auto-Sync ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
            </label>
          </div>

          {datasetName && (
            <>
              {/* Live Streaming Simulation Toggle */}
              <button 
                onClick={() => setIsStreamingActive(!isStreamingActive)}
                className={`btn ${isStreamingActive ? 'btn-rose anim-pulse' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Activity size={12} />
                <span>{isStreamingActive ? 'Stream Active' : 'Simulate Streaming'}</span>
              </button>

              {/* PII Masking GDPR Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', userSelect: 'none' }}>
                <Shield size={12} color={maskSensitiveData ? 'var(--accent-rose)' : 'var(--text-muted)'} />
                <span>GDPR Masking</span>
                <input 
                  type="checkbox" 
                  checked={maskSensitiveData}
                  onChange={(e) => setMaskSensitiveData(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent-rose)' }}
                />
              </label>

              <div className="badge badge-primary" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span>Context: <strong>{context.toUpperCase()}</strong></span>
              </div>
              <div className="badge badge-emerald" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Sparkles size={12} />
                <span>Initial Score: {originalQualityScore}%</span>
              </div>
              <div className="badge badge-cyan" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span>Healed Score: {globalQualityScore}%</span>
              </div>
            </>
          )}

          {!isGuidedMode && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setIsGuidedMode(true);
                setCurrentStage('ask');
                setUnlockedStages(['ask']);
                setProjectGoal(null);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', background: 'var(--primary-gradient)', border: 'none', color: '#fff', cursor: 'pointer' }}
              title="Start Guided AI Project Frame"
            >
              <Plus size={14} />
              <span>Project Mode</span>
            </button>
          )}
        </div>
      </header>

      {/* B. Interactive Guided Stage Navigator */}
      {isGuidedMode && (
        <VisualPipeline 
          currentStage={currentStage} 
          onStageSelect={setCurrentStage} 
          unlockedStages={unlockedStages} 
        />
      )}

      {/* Objective Summary Banner */}
      {isGuidedMode && projectGoal && currentStage !== 'ask' && (
        <div className="glass-panel fade-in" style={{ padding: '12px 20px', background: 'rgba(99,102,241,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Active Analysis Frame:</span>
            <h4 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{projectGoal.goalName}</h4>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KPI target lock: <strong>{projectGoal.kpis[0]}</strong></span>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
              onClick={() => setCurrentStage('ask')}
            >
              Adjust Goal Frame
            </button>
            <button 
              className="btn btn-rose" 
              style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--accent-rose)' }}
              onClick={() => {
                setIsGuidedMode(false);
                setCurrentStage('collect');
                setUnlockedStages(['collect']);
                setProjectGoal(null);
              }}
            >
              Exit Project Mode
            </button>
          </div>
        </div>
      )}

      {/* C. Loading Processing State */}
      {isProcessing && (
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="anim-pulse" style={{ background: 'var(--primary-gradient)', padding: '16px', borderRadius: '50%', color: '#fff' }}>
            <Cpu size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>AI Engine Processing Pipeline</h3>
            <p style={{ fontSize: '0.85rem' }}>Parsing column properties, checking type structures, and applying healing normalizers...</p>
          </div>
        </div>
      )}

      {/* D. Main Stage Panel */}
      {!isProcessing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {workflowMode === 'realtime' ? (
            <RealTimeAnalytics />
          ) : isGuidedMode ? (
            <>
              {/* STAGE 1: ASK */}
              {currentStage === 'ask' && (
                <AskWorkspace onSetProjectGoal={handleSetProjectGoal} />
              )}

              {/* STAGE 2: COLLECT */}
              {currentStage === 'collect' && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <Dashboard 
                    onDatasetLoad={handleDatasetLoad} 
                    datasetName={datasetName}
                    stats={datasetName ? {
                      qualityScore: globalQualityScore,
                      rowCount: rows.length,
                      colCount: headers.length,
                      healedCount: changesLog.length - duplicateCount,
                      duplicateCount: duplicateCount
                    } : null}
                    onReset={handleReset}
                    delimiter={delimiter}
                    onDelimiterChange={handleDelimiterChange}
                    imputeNumeric={imputeNumeric}
                    onImputeNumericChange={handleImputeNumericChange}
                  />

                  {!datasetName && (
                    <PipelineBacktester 
                      activeDatasetName={datasetName}
                      activeDatasetContent={rawContent}
                      onApplyStrategy={handleImputeNumericChange}
                    />
                  )}

                  {datasetName && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button className="btn btn-primary" onClick={() => setCurrentStage('investigate')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Proceed to Investigate Health
                        <Sparkles size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 3: INVESTIGATE */}
              {currentStage === 'investigate' && datasetName && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {hasSchemaDrift && (
                    <div className="glass-panel" style={{ padding: '12px 20px', background: 'rgba(244,63,94,0.02)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ShieldAlert size={16} color="var(--accent-rose)" className="anim-pulse" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <strong>AI Schema Drift Corrected:</strong> Remapped header columns automatically without breaking dashboards.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {remappings.map((rem, i) => (
                          <span key={i} className="badge badge-rose" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                            {rem.oldHeader} ➔ {rem.newHeader}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <DataAuditor 
                    anomalies={anomalies}
                    columnMetrics={columnMetrics}
                    globalQualityScore={globalQualityScore}
                    showCleaned={showCleaned}
                    onToggleCleaned={setShowCleaned}
                    changesLog={changesLog}
                    datasetName={datasetName}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setCurrentStage('collect')}>
                      Back to Collect
                    </button>
                    <button className="btn btn-primary" onClick={() => setCurrentStage('prepare')}>
                      Proceed to Prepare & Clean ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: PREPARE */}
              {currentStage === 'prepare' && datasetName && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="dashboard-grid">
                    <div className="dashboard-card-lg" style={{ gridColumn: 'span 8' }}>
                      <DataGrid 
                        headers={headers}
                        rows={filteredRows}
                        originalRows={originalRows}
                        schema={schema}
                        changesLog={changesLog}
                        showCleaned={showCleaned}
                        onCellEdit={handleCellEdit}
                        onColumnRename={handleColumnRename}
                        onColumnTypeChange={handleColumnTypeChange}
                        onColumnDrop={handleColumnDrop}
                        onRowDelete={handleRowDelete}
                        onColumnSplit={handleColumnSplit}
                        onColumnsMerge={handleColumnsMerge}
                        maskSensitiveData={maskSensitiveData}
                      />
                    </div>
                    <div className="dashboard-card-sm" style={{ gridColumn: 'span 4' }}>
                      <TransformationToolbox 
                        headers={headers}
                        onAddRow={handleAddRow}
                        onAddColumn={handleAddColumn}
                        onMoveColumn={handleMoveColumn}
                        onBulkAction={handleBulkAction}
                        onSmartDeduplicate={handleSmartDeduplicate}
                      />
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      Pipeline Version Control & Commit Lineage
                    </h3>
                    <AuditLineage 
                      headers={headers}
                      rows={rows}
                      originalRows={originalRows}
                      changesLog={changesLog}
                      globalQualityScore={globalQualityScore}
                      datasetName={datasetName}
                      activeBranch={activeBranch}
                      branchesList={branchesList}
                      commitHistory={commitHistory}
                      onCommit={commit}
                      onCreateBranch={createBranch}
                      onCheckoutBranch={checkoutBranch}
                      onRollback={rollback}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setCurrentStage('investigate')}>
                      Back to Investigate
                    </button>
                    <button className="btn btn-primary" onClick={() => setCurrentStage('analyze')}>
                      Proceed to Analyze ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 5: ANALYZE */}
              {currentStage === 'analyze' && datasetName && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="os-navigation-dock compare-toggle-container" style={{ width: '100%', marginBottom: '4px', display: 'flex', overflowX: 'auto' }}>
                    <button 
                      className={`compare-toggle-btn ${analyzeTab === 'dashboards' ? 'active' : ''}`}
                      onClick={() => setAnalyzeTab('dashboards')}
                    >
                      <BarChart3 size={14} /> Smart Dashboards
                    </button>
                    <button 
                      className={`compare-toggle-btn ${analyzeTab === 'simulator' ? 'active' : ''}`}
                      onClick={() => setAnalyzeTab('simulator')}
                    >
                      <Sliders size={14} /> Scenario Simulator
                    </button>
                    <button 
                      className={`compare-toggle-btn ${analyzeTab === 'predictive' ? 'active' : ''}`}
                      onClick={() => setAnalyzeTab('predictive')}
                    >
                      <TrendingUp size={14} /> Predictive Forecasts
                    </button>
                    <button 
                      className={`compare-toggle-btn ${analyzeTab === 'diagnostics' ? 'active' : ''}`}
                      onClick={() => setAnalyzeTab('diagnostics')}
                    >
                      <Network size={14} /> Diagnostics & Ontology
                    </button>
                    <button 
                      className={`compare-toggle-btn ${analyzeTab === 'agents' ? 'active' : ''}`}
                      onClick={() => setAnalyzeTab('agents')}
                    >
                      <Cpu size={14} /> Multi-Agent Console
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {analyzeTab === 'dashboards' && (
                      <SmartDashboard 
                        headers={headers} 
                        rows={filteredRows} 
                        schema={schema} 
                        context={context} 
                      />
                    )}

                    {analyzeTab === 'simulator' && (
                      <BusinessSimulator 
                        headers={headers}
                        rows={rows}
                        schema={schema}
                        context={context}
                      />
                    )}

                    {analyzeTab === 'predictive' && (
                      <PredictiveAnalytics 
                        headers={headers} 
                        rows={rows} 
                        schema={schema} 
                        context={context} 
                      />
                    )}

                    {analyzeTab === 'diagnostics' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="fade-in">
                        <RootCauseAnalyzer 
                          headers={headers}
                          rows={rows}
                          schema={schema}
                          context={context}
                        />
                        <SemanticOntology 
                          headers={headers}
                          rows={rows}
                          schema={schema}
                          context={context}
                        />
                      </div>
                    )}

                    {analyzeTab === 'agents' && (
                      <MultiAgentConsole 
                        datasetName={datasetName}
                        changesLog={changesLog}
                        anomalies={anomalies}
                        context={context}
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setCurrentStage('prepare')}>
                      Back to Prepare
                    </button>
                    <button className="btn btn-primary" onClick={() => setCurrentStage('present')}>
                      Proceed to Present ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 6: PRESENT */}
              {currentStage === 'present' && datasetName && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="os-navigation-dock compare-toggle-container" style={{ width: '100%', marginBottom: '4px', display: 'flex', overflowX: 'auto' }}>
                    <button 
                      className={`compare-toggle-btn ${presentTab === 'presentation' ? 'active' : ''}`}
                      onClick={() => setPresentTab('presentation')}
                    >
                      <FileText size={14} /> Presentation Slides
                    </button>
                    <button 
                      className={`compare-toggle-btn ${presentTab === 'export' ? 'active' : ''}`}
                      onClick={() => setPresentTab('export')}
                    >
                      <Download size={14} /> Export Center
                    </button>
                    <button 
                      className={`compare-toggle-btn ${presentTab === 'collab' ? 'active' : ''}`}
                      onClick={() => setPresentTab('collab')}
                    >
                      <Users size={14} /> Team Collaboration
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {presentTab === 'presentation' && (
                      <ReportGenerator 
                        headers={headers}
                        rows={rows}
                        schema={schema}
                        context={context}
                        globalQualityScore={globalQualityScore}
                        datasetName={datasetName}
                      />
                    )}

                    {presentTab === 'export' && (
                      <ExportCenter 
                        headers={headers}
                        rows={rows}
                        schema={schema}
                        datasetName={datasetName}
                      />
                    )}

                    {presentTab === 'collab' && (
                      <CollaborationWorkspace 
                        datasetName={datasetName} 
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setCurrentStage('analyze')}>
                      Back to Analyze
                    </button>
                    <button className="btn btn-primary" onClick={handleReset}>
                      Start New Session
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* DIRECT DATA HEALING UTILITY (LANDING PAGE & DIRECT CLEAN) */
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Dynamic Ingest / Direct summary header bar */}
              <Dashboard 
                onDatasetLoad={handleDatasetLoad} 
                datasetName={datasetName}
                stats={datasetName ? {
                  qualityScore: globalQualityScore,
                  rowCount: rows.length,
                  colCount: headers.length,
                  healedCount: changesLog.length - duplicateCount,
                  duplicateCount: duplicateCount
                } : null}
                onReset={handleReset}
                delimiter={delimiter}
                onDelimiterChange={handleDelimiterChange}
                imputeNumeric={imputeNumeric}
                onImputeNumericChange={handleImputeNumericChange}
              />

              {!datasetName && (
                <PipelineBacktester 
                  activeDatasetName={datasetName}
                  activeDatasetContent={rawContent}
                  onApplyStrategy={handleImputeNumericChange}
                />
              )}

              {datasetName && (
                <>
                  {/* Schema Drift banner for direct upload */}
                  {hasSchemaDrift && (
                    <div className="glass-panel" style={{ padding: '12px 20px', background: 'rgba(244,63,94,0.02)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ShieldAlert size={16} color="var(--accent-rose)" className="anim-pulse" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <strong>AI Schema Drift Corrected:</strong> Remapped header columns automatically.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {remappings.map((rem, i) => (
                          <span key={i} className="badge badge-rose" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                            {rem.oldHeader} ➔ {rem.newHeader}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct mode Sub-navigation (Flat 10-Tab Dock) */}
                  <div className="os-navigation-dock compare-toggle-container" style={{ width: '100%', marginBottom: '16px', display: 'flex', overflowX: 'auto' }}>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'dashboards' ? 'active' : ''}`}
                      onClick={() => setActiveTab('dashboards')}
                    >
                      <BarChart3 size={14} /> Smart Dashboards
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'grid' ? 'active' : ''}`}
                      onClick={() => setActiveTab('grid')}
                    >
                      <Layout size={14} /> Data Grid & Profiler
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'agents' ? 'active' : ''}`}
                      onClick={() => setActiveTab('agents')}
                    >
                      <Cpu size={14} /> Multi-Agent Console
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'simulator' ? 'active' : ''}`}
                      onClick={() => setActiveTab('simulator')}
                    >
                      <Sliders size={14} /> Scenario Simulator
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
                      onClick={() => setActiveTab('diagnostics')}
                    >
                      <Network size={14} /> Diagnostics & Ontology
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'predictive' ? 'active' : ''}`}
                      onClick={() => setActiveTab('predictive')}
                    >
                      <TrendingUp size={14} /> Predictive Forecasts
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'collab' ? 'active' : ''}`}
                      onClick={() => setActiveTab('collab')}
                    >
                      <Users size={14} /> Team Collaboration
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'lineage' ? 'active' : ''}`}
                      onClick={() => setActiveTab('lineage')}
                    >
                      <FileText size={14} /> Flow Audit Lineage
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'presentation' ? 'active' : ''}`}
                      onClick={() => setActiveTab('presentation')}
                    >
                      <Activity size={14} /> Presentation Slides
                    </button>
                    <button 
                      className={`compare-toggle-btn ${activeTab === 'export' ? 'active' : ''}`}
                      onClick={() => setActiveTab('export')}
                    >
                      <Download size={14} /> Export Center
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-in">
                    
                    {/* 1. SMART DASHBOARDS */}
                    {activeTab === 'dashboards' && (
                      <SmartDashboard 
                        headers={headers} 
                        rows={filteredRows} 
                        schema={schema} 
                        context={context} 
                      />
                    )}

                    {/* 2. DATA GRID & PROFILER */}
                    {activeTab === 'grid' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <DataAuditor 
                          anomalies={anomalies}
                          columnMetrics={columnMetrics}
                          globalQualityScore={globalQualityScore}
                          showCleaned={showCleaned}
                          onToggleCleaned={setShowCleaned}
                          changesLog={changesLog}
                          datasetName={datasetName}
                        />

                        <div className="dashboard-grid">
                          <div className="dashboard-card-lg" style={{ gridColumn: 'span 8' }}>
                            <DataGrid 
                              headers={headers}
                              rows={filteredRows}
                              originalRows={originalRows}
                              schema={schema}
                              changesLog={changesLog}
                              showCleaned={showCleaned}
                              onCellEdit={handleCellEdit}
                              onColumnRename={handleColumnRename}
                              onColumnTypeChange={handleColumnTypeChange}
                              onColumnDrop={handleColumnDrop}
                              onRowDelete={handleRowDelete}
                              onColumnSplit={handleColumnSplit}
                              onColumnsMerge={handleColumnsMerge}
                              maskSensitiveData={maskSensitiveData}
                            />
                          </div>
                          <div className="dashboard-card-sm" style={{ gridColumn: 'span 4' }}>
                            <TransformationToolbox 
                              headers={headers}
                              onAddRow={handleAddRow}
                              onAddColumn={handleAddColumn}
                              onMoveColumn={handleMoveColumn}
                              onBulkAction={handleBulkAction}
                              onSmartDeduplicate={handleSmartDeduplicate}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. MULTI-AGENT CONSOLE */}
                    {activeTab === 'agents' && (
                      <MultiAgentConsole 
                        datasetName={datasetName}
                        changesLog={changesLog}
                        anomalies={anomalies}
                        context={context}
                      />
                    )}

                    {/* 4. SCENARIO SIMULATOR */}
                    {activeTab === 'simulator' && (
                      <BusinessSimulator 
                        headers={headers}
                        rows={rows}
                        schema={schema}
                        context={context}
                      />
                    )}

                    {/* 5. DIAGNOSTICS & ONTOLOGY */}
                    {activeTab === 'diagnostics' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="fade-in">
                        <RootCauseAnalyzer 
                          headers={headers}
                          rows={rows}
                          schema={schema}
                          context={context}
                        />
                        <SemanticOntology 
                          headers={headers}
                          rows={rows}
                          schema={schema}
                          context={context}
                        />
                      </div>
                    )}

                    {/* 6. PREDICTIVE FORECASTS */}
                    {activeTab === 'predictive' && (
                      <PredictiveAnalytics 
                        headers={headers} 
                        rows={rows} 
                        schema={schema} 
                        context={context} 
                      />
                    )}

                    {/* 7. TEAM COLLABORATION */}
                    {activeTab === 'collab' && (
                      <CollaborationWorkspace 
                        datasetName={datasetName} 
                      />
                    )}

                    {/* 8. FLOW AUDIT LINEAGE */}
                    {activeTab === 'lineage' && (
                      <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                          Pipeline Version Control & Commit Lineage
                        </h3>
                        <AuditLineage 
                          headers={headers}
                          rows={rows}
                          originalRows={originalRows}
                          changesLog={changesLog}
                          globalQualityScore={globalQualityScore}
                          datasetName={datasetName}
                          activeBranch={activeBranch}
                          branchesList={branchesList}
                          commitHistory={commitHistory}
                          onCommit={commit}
                          onCreateBranch={createBranch}
                          onCheckoutBranch={checkoutBranch}
                          onRollback={rollback}
                        />
                      </div>
                    )}

                    {/* 9. PRESENTATION SLIDES */}
                    {activeTab === 'presentation' && (
                      <ReportGenerator 
                        headers={headers}
                        rows={rows}
                        schema={schema}
                        context={context}
                        globalQualityScore={globalQualityScore}
                        datasetName={datasetName}
                      />
                    )}

                    {/* 10. EXPORT CENTER */}
                    {activeTab === 'export' && (
                      <ExportCenter 
                        headers={headers}
                        rows={rows}
                        schema={schema}
                        datasetName={datasetName}
                      />
                    )}

                  </div>
                </>
              )}

            </div>
          )}

        </div>
      )}

      {/* Floating AI Copilot Trigger and Drawer */}
      {datasetName && (
        <div className="floating-copilot-container">
          {isCopilotOpen && (
            <div className="floating-copilot-window">
              <AICopilot 
                headers={headers} 
                rows={rows} 
                schema={schema} 
                context={context} 
                currentStage={currentStage}
                isGuidedMode={isGuidedMode}
                onFilterDataset={handleFilterDataset} 
                onResetFilters={handleResetFilters} 
                onClose={() => setIsCopilotOpen(false)}
              />
            </div>
          )}
          <button 
            type="button"
            className="floating-copilot-trigger"
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            title={isCopilotOpen ? "Close Copilot" : "Open Copilot"}
          >
            {isCopilotOpen ? <X size={24} /> : <Sparkles size={24} />}
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
