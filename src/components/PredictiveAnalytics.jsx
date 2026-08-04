import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Line
} from 'recharts';
import { TrendingUp, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { generateForecast, predictChurnRisk } from '../utils/healingEngine';

export default function PredictiveAnalytics({ 
  headers, 
  rows, 
  schema, 
  context 
}) {
  const numericHeaders = useMemo(() => {
    return headers.filter(h => 
      schema[h] === 'Integer' || 
      schema[h] === 'Float' || 
      schema[h] === 'Currency' || 
      schema[h] === 'Percentage'
    );
  }, [headers, schema]);
  
  const dateHeaders = useMemo(() => {
    return headers.filter(h => schema[h] === 'Date');
  }, [headers, schema]);

  const [selectedValColOverride, setSelectedValColOverride] = useState(null);
  const [selectedDateColOverride, setSelectedDateColOverride] = useState(null);
  const [forecastSteps, setForecastSteps] = useState(6);

  const selectedValCol = (selectedValColOverride && numericHeaders.includes(selectedValColOverride)) 
    ? selectedValColOverride 
    : (numericHeaders[0] || '');

  const selectedDateCol = (selectedDateColOverride && dateHeaders.includes(selectedDateColOverride)) 
    ? selectedDateColOverride 
    : (dateHeaders[0] || '');

  const modelResult = useMemo(() => {
    if (selectedValCol) {
      return generateForecast(headers, rows, selectedValCol, selectedDateCol, forecastSteps);
    }
    return null;
  }, [headers, rows, selectedValCol, selectedDateCol, forecastSteps]);

  const churnRisks = useMemo(() => {
    return predictChurnRisk(headers, rows, context);
  }, [headers, rows, context]);

  // Transform data for charting (fit history + project future)
  const getChartData = () => {
    if (!modelResult) return [];
    
    const hist = modelResult.history.map(pt => ({
      name: pt.date,
      Historical: pt.value,
      TrendFit: pt.fit
    }));

    const fore = modelResult.forecast.map(pt => ({
      name: pt.date,
      Projected: pt.value,
      ConfidenceUpper: pt.ciUpper,
      ConfidenceLower: pt.ciLower
    }));

    // To connect the line on the chart, repeat the last historical point in projected
    if (hist.length > 0 && fore.length > 0) {
      fore[0].Projected = hist[hist.length - 1].Historical;
      fore[0].ConfidenceUpper = hist[hist.length - 1].Historical;
      fore[0].ConfidenceLower = hist[hist.length - 1].Historical;
    }

    return [...hist, ...fore];
  };

  const chartData = getChartData();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Forecasting controls */}
      <div className="dashboard-grid">
        
        {/* Controls Panel */}
        <div className="dashboard-card-sm glass-panel glow-purple" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-purple)" />
            Regression Forecast Model
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Fit mathematical trends on numerical properties to project future values.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Forecast Metric (y)</label>
              <select 
                className="input-field" 
                value={selectedValCol} 
                onChange={(e) => setSelectedValColOverride(e.target.value)}
                style={{ background: 'var(--bg-surface-elevated)', padding: '6px 10px', fontSize: '0.8rem' }}
              >
                {numericHeaders.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Time Column (x)</label>
              <select 
                className="input-field" 
                value={selectedDateCol} 
                onChange={(e) => setSelectedDateColOverride(e.target.value)}
                style={{ background: 'var(--bg-surface-elevated)', padding: '6px 10px', fontSize: '0.8rem' }}
              >
                <option value="">Sequence Index (Auto)</option>
                {dateHeaders.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Horizon Steps</label>
              <select 
                className="input-field" 
                value={forecastSteps} 
                onChange={(e) => setForecastSteps(parseInt(e.target.value))}
                style={{ background: 'var(--bg-surface-elevated)', padding: '6px 10px', fontSize: '0.8rem' }}
              >
                <option value="3">3 Periods Ahead</option>
                <option value="6">6 Periods Ahead</option>
                <option value="12">12 Periods Ahead</option>
              </select>
            </div>
          </div>

          {modelResult && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trend Line:</span>
                <span style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
                  y = {modelResult.trendSlope?.toFixed(2)}x + {modelResult.yIntercept?.toFixed(1)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Standard Error:</span>
                <span style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                  ±{modelResult.standardError?.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Forecast visual chart */}
        <div className="dashboard-card-lg glass-panel glow-primary" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--primary)" />
              Predictive Time Series Forecast (95% CI)
            </h3>
            <span className="badge badge-purple">ML Engine Enabled</span>
          </div>

          <div style={{ width: '100%', height: '260px', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '12px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.75rem' }} />
                  {/* Shaded confidence interval bounds */}
                  <Area dataKey="ConfidenceUpper" stroke="none" fill="url(#confidenceBand)" />
                  <Area dataKey="ConfidenceLower" stroke="none" fill="none" />
                  
                  {/* Main data lines */}
                  <Line type="monotone" dataKey="Historical" stroke="var(--accent-cyan)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="TrendFit" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="Projected" stroke="var(--accent-purple)" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Please select numeric metrics for time-series modeling.
              </div>
            )}
          </div>

          {modelResult && (
            <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
              <Sparkles size={16} color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.4' }}>{modelResult.text}</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Customer Attrition / Churn Risk audit list */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--accent-rose)" />
              Customer Retention Attrition Auditor
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Heuristic retention risk scoring based on status flags, age constraints, and payment sizes.
            </p>
          </div>
          <span className="badge badge-rose">Heuristic Classifier Active</span>
        </div>

        <div className="data-table-container" style={{ maxHeight: '250px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Name / Node</th>
                <th>Category Segment</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Primary Drivers</th>
              </tr>
            </thead>
            <tbody>
              {churnRisks.slice(0, 10).map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>#{r.id}</td>
                  <td className="predictive-row-name" style={{ fontWeight: '700', color: '#fff' }}>{r.name}</td>
                  <td><span className="badge badge-primary">{r.segment}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, width: '60px', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            background: r.score >= 70 ? 'var(--rose-gradient)' : r.score >= 40 ? 'var(--accent-amber)' : 'var(--emerald-gradient)', 
                            width: `${r.score}%` 
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', width: '30px' }}>{r.score}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${r.labelClass}`} style={{ fontSize: '0.65rem' }}>{r.label}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', whiteSpace: 'normal' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {r.reasons.map((reason, idx) => (
                        <span key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {reason}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
