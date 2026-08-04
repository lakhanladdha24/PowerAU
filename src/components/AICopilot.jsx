import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Mic, MicOff, Terminal, BarChart2, Check, X } from 'lucide-react';
import { generateForecast, predictChurnRisk, getNumericValues } from '../utils/healingEngine';

export default function AICopilot({ 
  headers, 
  rows, 
  schema, 
  context, 
  currentStage,
  isGuidedMode,
  onFilterDataset, 
  onResetFilters,
  onClose
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your BI Copilot. I will assist you in cleaning and analyzing your business data.",
      agent: 'Insight Agent',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  useEffect(() => {
    let guideText = "";
    let activeAgent = "Co-Analyst Engine";
    
    if (!isGuidedMode) {
      guideText = "Direct Ingestion mode active: I can help clean, deduplicate, format, and filter your spreadsheet records. Tell me what columns to audit or clean.";
      activeAgent = "Healing Engine";
    } else {
      if (currentStage === 'ask') {
        guideText = "Define stage active: Describe your business problem in natural language, or click a template, and I'll map out target metrics, KPIs, and models.";
        activeAgent = "Goal Architect";
      } else if (currentStage === 'collect') {
        guideText = "Collection stage active: Connect your data source or load sandboxes. I'll auto-verify the variables against your ask framework.";
        activeAgent = "Ingest Copilot";
      } else if (currentStage === 'investigate') {
        guideText = "Investigate stage active: I have audited your dataset. Ask me to list anomalies, outline outlier profiles, or show target column statistics.";
        activeAgent = "Audit & Profiler";
      } else if (currentStage === 'prepare') {
        guideText = "Prepare stage active: I can help clean, deduplicate, and impute columns without writing code. Tell me what cleaning rules to apply.";
        activeAgent = "Healing Engine";
      } else if (currentStage === 'analyze') {
        guideText = "Analyze stage active: Statistical models are ready. Ask me to 'forecast payments trends', run segmentations, or inspect feature importance.";
        activeAgent = "ML Engine Agent";
      } else if (currentStage === 'present') {
        guideText = "Present stage active: Your final deck is prepared. Ask me to draft executive descriptions, summarize key parameters, or export structures.";
        activeAgent = "Reporting Agent";
      }
    }

    let timer = null;
    if (guideText) {
      timer = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: guideText,
            agent: activeAgent,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStage, isGuidedMode]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSQL, setShowSQL] = useState(null); // index of message to show SQL details
  const messagesEndRef = useRef(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup Web Speech API if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const suggestPrompt = (promptText) => {
    const userMsg = {
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    processAIResponse(promptText);
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    // Append User Message
    const userMsg = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    processAIResponse(userText);
  };

  // Safe header finder (case-insensitive and partial match)
  const resolveHeader = (keywords) => {
    const colsLower = headers.map(h => h.toLowerCase());
    for (const kw of keywords) {
      const idx = colsLower.findIndex(c => c.includes(kw));
      if (idx !== -1) return headers[idx];
    }
    return null;
  };


  const processAIResponse = (query) => {
    const q = query.toLowerCase();
    
    // Default reply elements
    let replyText = "";
    let replyChart = null;
    let sqlQuery = "";
    let reasoning = [];
    let activeAgent = "Insight Agent";

    // Column finders
    const amountCol = resolveHeader(['amount', 'payment', 'revenue', 'price', 'sales', 'spend']);
    const ageCol = resolveHeader(['age']);
    const courseCol = resolveHeader(['course', 'product', 'category', 'sensor_id', 'country', 'department']);
    const dateCol = resolveHeader(['date', 'time', 'created']);

    // 1. Forecast query
    if (q.includes('forecast') || q.includes('predict') || q.includes('future') || q.includes('trend')) {
      activeAgent = "Forecasting Agent";
      const targetCol = amountCol || ageCol || (headers.find(h => schema[h] === 'Integer' || schema[h] === 'Float' || schema[h] === 'Currency'));
      
      if (targetCol) {
        const fc = generateForecast(headers, rows, targetCol, dateCol, 6);
        replyText = `Forecast model generated for **${targetCol}**. ${fc.text}`;
        sqlQuery = `SELECT ${dateCol || 'observation_cycle'}, ${targetCol}\nFROM active_dataset\nORDER BY 1 ASC;\n/* Running Linear Regression Model */`;
        reasoning = [
          "Data Cleaning Agent verified column is numeric.",
          `Forecasting Agent applied linear regression on ${targetCol} against time-series sequence.`,
          "Visualization Agent designed confidence interval Area Chart."
        ];

        // Prepare chart payload
        const allPoints = [
          ...fc.history.slice(-10).map(pt => ({ label: pt.date.slice(-5), val: pt.value, type: 'Historical' })),
          ...fc.forecast.map(pt => ({ label: pt.date.slice(-5), val: pt.value, upper: pt.ciUpper, lower: pt.ciLower, type: 'Forecast' }))
        ];

        replyChart = {
          type: 'forecast',
          data: allPoints,
          title: `6-Period Forecast: ${targetCol}`
        };
      } else {
        replyText = "I couldn't identify a numeric or financial column in this dataset to forecast. Please verify your schema casting.";
      }
    }

    // 2. Churn Risk / Anomalies query
    else if (q.includes('churn') || q.includes('risk') || q.includes('attrition') || q.includes('danger')) {
      activeAgent = "Forecasting Agent";
      const riskList = predictChurnRisk(headers, rows, context);
      
      if (riskList.length > 0) {
        const topRisks = riskList.slice(0, 5);
        replyText = `Risk assessment complete. I analyzed engagement thresholds. Here are the top records displaying critical/medium retention risks:\n\n` +
          topRisks.map(r => `• **${r.name}** (${r.segment}): Churn Probability **${r.score}%** (${r.label})`).join('\n');
        
        sqlQuery = `SELECT name, age, payments, status, \n       CASE WHEN status = 'pending' THEN 75 ELSE 20 END AS churn_risk\nFROM active_dataset\nORDER BY churn_risk DESC\nLIMIT 5;`;
        
        reasoning = [
          "Insight Agent segmenting users by age demographics & payments.",
          "Forecasting Agent running predictive customer attrition weights.",
          "Reporting Agent compiled retention alerts."
        ];

        replyChart = {
          type: 'bar',
          data: topRisks.map(r => ({ label: r.name.slice(0, 10), val: r.score })),
          title: 'Retention / Attrition Probability (%)'
        };
      } else {
        replyText = "I couldn't perform attrition auditing on this dataset. It requires customer status or transactional fields.";
      }
    }

    // 3. Category/Course Breakdown (Top Items)
    else if (q.includes('top') || q.includes('most popular') || q.includes('courses') || q.includes('products') || q.includes('distribution')) {
      activeAgent = "Insight Agent";
      const targetCol = courseCol || headers.find(h => schema[h] === 'String');
      
      if (targetCol) {
        const freqMap = {};
        rows.forEach(r => {
          const val = String(r[targetCol] || '').trim();
          if (val) freqMap[val] = (freqMap[val] || 0) + 1;
        });

        const sorted = Object.entries(freqMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        replyText = `Category analysis completed for column **${targetCol}**. The primary driver is **${sorted[0]?.[0]}** with **${sorted[0]?.[1]}** occurrences, followed by **${sorted[1]?.[0]}**.`;
        
        sqlQuery = `SELECT [\`${targetCol}\`], COUNT(*)\nFROM active_dataset\nGROUP BY 1\nORDER BY 2 DESC\nLIMIT 5;`;
        
        reasoning = [
          `Orchestrator mapped target column '${targetCol}' for discrete grouping.`,
          "Insight Agent grouped records and sorted frequencies.",
          "Visualization Agent drew distribution layout."
        ];

        replyChart = {
          type: 'bar',
          data: sorted.map(([k, v]) => ({ label: k.slice(0, 12), val: v })),
          title: `Distribution of ${targetCol}`
        };
      } else {
        replyText = "I couldn't find a categorical column (like products, courses, countries) to aggregate.";
      }
    }

    // 4. Filters & Operations (e.g., "Show rows where Age > 22" or "payments > 1000")
    else if (q.includes('filter') || q.includes('show where') || q.includes('>') || q.includes('<') || q.includes('equal') || q.includes('only')) {
      activeAgent = "Data Cleaning Agent";
      
      // Try to parse filter: e.g. "age > 20"
      let filterCol = null;
      let operator = null;
      let thresholdVal = null;

      // Find which header is mentioned in query
      headers.forEach(h => {
        if (q.includes(h.toLowerCase())) filterCol = h;
      });

      // Simple parse operators
      if (q.includes('>')) operator = '>';
      else if (q.includes('<')) operator = '<';
      else if (q.includes('=')) operator = '=';

      const matchNum = q.match(/\d+/);
      if (matchNum) thresholdVal = parseFloat(matchNum[0]);

      if (filterCol && operator && thresholdVal !== null) {
        // Run filter
        const preCount = rows.length;
        const filtered = rows.filter(r => {
          const val = parseFloat(String(r[filterCol]).replace(/[^\d.-]/g, ''));
          if (isNaN(val)) return false;
          if (operator === '>') return val > thresholdVal;
          if (operator === '<') return val < thresholdVal;
          return val === thresholdVal;
        });

        if (filtered.length > 0) {
          onFilterDataset(filtered);
          replyText = `Data pipeline filter applied successfully! Displaying **${filtered.length}** records where **${filterCol} ${operator} ${thresholdVal}** (dropped ${preCount - filtered.length} rows). A temporary workspace has been loaded.`;
          sqlQuery = `SELECT *\nFROM active_dataset\nWHERE [\`${filterCol}\`] ${operator} ${thresholdVal};`;
          
          reasoning = [
            `User requested filter threshold in ${filterCol}.`,
            `Data Cleaning Agent executed client-side workspace filter.`,
            "Grid dashboard layout updated dynamically."
          ];
        } else {
          replyText = `I processed the filter: **${filterCol} ${operator} ${thresholdVal}**, but no rows matched the condition in the dataset. Workspace remains unchanged.`;
        }
      } else {
        // Fallback filter advice
        replyText = `To filter rows, specify a column and condition. E.g. **"Filter course Data Science"** or **"Show where Payments > 1000"**.`;
      }
    }

    // 5. Statistics & Averages
    else if (q.includes('average') || q.includes('mean') || q.includes('sum') || q.includes('total') || q.includes('stats')) {
      activeAgent = "Insight Agent";
      const targetCol = amountCol || ageCol || headers.find(h => schema[h] === 'Integer' || schema[h] === 'Float' || schema[h] === 'Currency');

      if (targetCol) {
        const vals = getNumericValues(rows, targetCol);
        if (vals.length > 0) {
          const sum = vals.reduce((a, b) => a + b, 0);
          const mean = sum / vals.length;
          const max = Math.max(...vals);
          const min = Math.min(...vals);

          replyText = `Here are the statistical parameters for **${targetCol}**:\n` +
            `• **Mean (Average):** ${mean.toFixed(2)}\n` +
            `• **Aggregate Sum:** ${sum.toLocaleString()}\n` +
            `• **Max Observed:** ${max.toLocaleString()}\n` +
            `• **Min Observed:** ${min.toLocaleString()}`;

          sqlQuery = `SELECT AVG([\`${targetCol}\`]) AS mean, SUM([\`${targetCol}\`]) AS total,\n       MAX([\`${targetCol}\`]) AS max, MIN([\`${targetCol}\`]) AS min\nFROM active_dataset;`;

          reasoning = [
            `Target column '${targetCol}' selected for numerical profile.`,
            "Insight Agent compiled math aggregates.",
            "Reporting Agent parsed parameters to chat box."
          ];

          replyChart = {
            type: 'bar',
            data: [
              { label: 'Min', val: min },
              { label: 'Avg', val: mean },
              { label: 'Max', val: max }
            ],
            title: `Metrics profile: ${targetCol}`
          };
        } else {
          replyText = `I couldn't aggregate **${targetCol}** because it doesn't contain valid parsed numbers. Check type casting in grid header.`;
        }
      } else {
        replyText = "I couldn't identify a numeric column to calculate statistics for. Try casting one as an Integer or Float.";
      }
    }

    // 6. Reset Filters
    else if (q.includes('reset') || q.includes('clear') || q.includes('all rows')) {
      onResetFilters();
      replyText = "Filters cleared! Active dataset restored to full raw count.";
      sqlQuery = "SELECT * FROM active_dataset;";
      reasoning = ["User requested workspace state reset.", "Orchestrator reloaded main dataset state."];
    }

    // 7. General fallback chat
    else {
      replyText = `I received your prompt: "${query}". You can ask me to:\n` +
        `1. **Aggregate values**: "Show top courses/products" or "Breakdown categories".\n` +
        `2. **Run statistics**: "What is the average age?" or "Total payments sum".\n` +
        `3. **Filter data**: "Filter payments > 1000" or "Show where age > 21".\n` +
        `4. **Forecast values**: "Forecast next 6 periods of payments".\n` +
        `5. **Audit Churn Risks**: "Predict customer attrition risk".`;
      sqlQuery = `-- No direct SQL mapping inferred for: "${query}"`;
      reasoning = ["Insight Agent listening to natural language.", "Matching command library parameters."];
    }

    // Append AI Message after a brief typing simulation delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: replyText,
        chart: replyChart,
        sql: sqlQuery,
        reasoning,
        agent: activeAgent,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 400);
  };

  return (
    <div className="glass-panel glow-cyan fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px', maxHeight: '680px', overflow: 'hidden' }}>
      
      {/* A. Copilot Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="anim-pulse" style={{ background: 'var(--cyan-gradient)', padding: '6px', borderRadius: '50%', color: '#fff' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>AI Analytics Copilot</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="bullet-active" /> Conversational Agent Pipeline Active
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>OS Agent v1.2</span>
          {onClose && (
            <button 
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
              className="column-action-btn"
              title="Close Copilot"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* B. Message History Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {/* Sender bubble */}
            <div 
              className={msg.sender === 'user' ? 'user-chat-bubble' : 'ai-chat-bubble'}
            >
              {msg.sender === 'ai' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    🤖 {msg.agent}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                </div>
              )}
              
              <p style={{ fontSize: '0.825rem', color: '#fff', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                {msg.text}
              </p>

              {/* Render dynamic SVG charts directly in the chat bubble */}
              {msg.chart && (
                <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BarChart2 size={12} color="var(--accent-cyan)" />
                    {msg.chart.title}
                  </div>

                  {msg.chart.type === 'bar' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {msg.chart.data.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.65rem', width: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{d.label}</span>
                          <div style={{ flex: 1, height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                background: 'var(--cyan-gradient)', 
                                width: `${Math.min(100, Math.max(5, (d.val / Math.max(...msg.chart.data.map(x => x.val || 1))) * 100))}%` 
                              }} 
                            />
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', width: '40px', textAlign: 'right' }}>{Math.round(d.val)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.chart.type === 'forecast' && (
                    <div style={{ height: '120px', position: 'relative', borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 4px 0' }}>
                      {msg.chart.data.map((d, i) => {
                        const maxVal = Math.max(...msg.chart.data.map(x => x.upper || x.val || 1));
                        const minVal = Math.min(...msg.chart.data.map(x => x.lower || x.val || 0));
                        const range = maxVal - minVal || 1;
                        const pct = ((d.val - minVal) / range) * 100;
                        const uPct = d.upper ? ((d.upper - minVal) / range) * 100 : pct;
                        const lPct = d.lower ? ((d.lower - minVal) / range) * 100 : pct;

                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: `${90 / msg.chart.data.length}%` }} title={`${d.label}: ${d.val} (${d.type})`}>
                            {d.type === 'Forecast' && (
                              <div style={{ width: '4px', background: 'rgba(168, 85, 247, 0.15)', height: `${uPct - lPct}%`, position: 'absolute', bottom: `${lPct}%` }} />
                            )}
                            <div 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                background: d.type === 'Forecast' ? 'var(--accent-purple)' : 'var(--accent-cyan)', 
                                zIndex: 2, 
                                position: 'absolute', 
                                bottom: `${pct}%`,
                                transform: 'translateY(3px)'
                              }} 
                            />
                          </div>
                        );
                      })}
                      <div style={{ position: 'absolute', top: 2, right: 2, fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                        Cyan = Historical, Purple = Forecast
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons (Lineage reasoning, SQL) */}
              {msg.sender === 'ai' && (msg.sql || msg.reasoning?.length > 0) && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                  {msg.sql && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '3px 8px', fontSize: '0.65rem', borderRadius: '4px' }}
                      onClick={() => setShowSQL(showSQL === index ? null : index)}
                    >
                      <Terminal size={10} />
                      {showSQL === index ? 'Hide SQL Code' : 'Compile SQL Query'}
                    </button>
                  )}
                </div>
              )}

              {/* Show SQL Panel */}
              {showSQL === index && msg.sql && (
                <div className="code-snippet-box fade-in" style={{ marginTop: '8px', fontSize: '0.7rem', padding: '8px', background: '#03050a', border: '1px solid var(--border-color-glow)' }}>
                  <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{msg.sql}</code>
                </div>
              )}

              {/* Reasoning agent stack */}
              {msg.sender === 'ai' && msg.reasoning?.length > 0 && (
                <div style={{ marginTop: '6px', borderTop: '1px dotted rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>AI Pipeline Reasoning:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {msg.reasoning.map((r, rIdx) => (
                      <div key={rIdx} style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Check size={8} color="var(--accent-emerald)" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* C. Quick Suggestions Bar */}
      <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {(() => {
          const suggestions = (() => {
            if (!isGuidedMode) {
              return [
                { label: "Audit data quality", prompt: "What is my data quality score and how can I improve it?" },
                { label: "List dataset anomalies", prompt: "Show me a detailed list of duplicates and outlier counts." },
                { label: "Impute numeric nulls", prompt: "Run numerical mean imputation across all missing values." },
                { label: "Deduplicate client rows", prompt: "Run smart deduplication to purge repeated client rows." }
              ];
            }
            switch (currentStage) {
              case 'ask':
                return [
                  { label: "Target customer churn", prompt: "How do I predict subscription attrition risks and drivers?" },
                  { label: "Predict next quarter revenue", prompt: "I need to forecast next quarter sales and advertising trends." },
                  { label: "Analyze grade correlations", prompt: "Verify attendance correlations against final exam grades." }
                ];
              case 'collect':
                return [
                  { label: "Verify variables mapping", prompt: "Do the columns of my dataset map to the locked churn framework?" },
                  { label: "Simulate database schema drift", prompt: "Explain how schema drift remappings work in PowerAU." }
                ];
              case 'investigate':
                return [
                  { label: "Explain Quality Score", prompt: "What is my data quality score and how can I improve it?" },
                  { label: "Summarize anomalies", prompt: "Show me a detailed list of duplicates and outlier counts." }
                ];
              case 'prepare':
                return [
                  { label: "Impute numerical averages", prompt: "Run numerical mean imputation across all missing values." },
                  { label: "Merge duplicates", prompt: "Run smart deduplication to purge repeated client rows." }
                ];
              case 'analyze':
                return [
                  { label: "Forecast payment trends", prompt: "Generate forecast payments trends models." },
                  { label: "Assess attrition probabilities", prompt: "Run attrition risk models for active users." },
                  { label: "Chart categories distribution", prompt: "Show categories distribution break downs." }
                ];
              case 'present':
                return [
                  { label: "Draft Executive Summary", prompt: "Write a plain-language executive report of the analytics results." },
                  { label: "Generate slide structure", prompt: "Format a presentation deck summarizing these predictions." }
                ];
              default:
                return [];
            }
          })();

          return suggestions.map((s, i) => (
            <button 
              key={i}
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '12px' }}
              onClick={() => suggestPrompt(s.prompt)}
            >
              {s.label}
            </button>
          ));
        })()}
        
        <button 
          className="btn btn-secondary" 
          style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '12px', borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
          onClick={() => suggestPrompt("Clear filters")}
        >
          Reset Dataset
        </button>
      </div>

      {/* D. Input Bar */}
      <form 
        onSubmit={handleSend}
        style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(12,16,32,0.9)' }}
      >
        <button 
          type="button"
          onClick={toggleSpeech}
          className={`btn ${isListening ? 'btn-rose anim-pulse' : 'btn-secondary'}`}
          style={{ padding: '10px', borderRadius: '50%', flexShrink: 0 }}
          title="Voice Command (Web Speech Recognition)"
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input 
          type="text" 
          placeholder={isListening ? "Listening..." : "Ask copilot to filter, stats, chart, forecast..."}
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ fontSize: '0.85rem' }}
          disabled={isListening}
        />

        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ padding: '10px', borderRadius: '50%', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
