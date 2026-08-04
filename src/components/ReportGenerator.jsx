import { useState } from 'react';
import { FileText, ChevronLeft, ChevronRight, RefreshCw, Printer, AlertCircle } from 'lucide-react';
import { calculateKPIs, generateForecast } from '../utils/healingEngine';

export default function ReportGenerator({ 
  headers, 
  rows, 
  schema, 
  context, 
  globalQualityScore, 
  datasetName 
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  const kpis = calculateKPIs(headers, rows, context, schema);
  
  // Find a numeric column to summarize
  const valCol = headers.find(h => 
    schema[h] === 'Integer' || 
    schema[h] === 'Float' || 
    schema[h] === 'Currency' ||
    schema[h] === 'Percentage'
  ) || '';
  
  const dateCol = headers.find(h => schema[h] === 'Date') || '';
  const forecast = valCol ? generateForecast(headers, rows, valCol, dateCol, 6) : null;

  const slides = [
    {
      title: 'Executive Ingestion Overview',
      subtitle: 'Data Ingestion & Verification Summary',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            The raw data file **{datasetName || 'dataset.csv'}** has been ingested successfully into the AI Data Operating System. The schema validation and healing engines have completed profiling and normalization sweeps.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quality Audit Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{globalQualityScore}% Healthy</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Row observations count</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{rows.length} Records</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Automated Key Business Metrics',
      subtitle: 'Contextual KPI Profiles',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            Based on data headers and content distributions, the pipeline inferred an **{context.toUpperCase()}** business category context. The following standard KPIs were calculated:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
            {kpis.map((k, i) => (
              <div key={i} className="kpi-report-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{k.label}</span>
                <span className="kpi-report-value" style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{k.value}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Predictive Horizon Outlook',
      subtitle: 'Regression Trends & Projections',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {forecast ? (
            <>
              <p>
                A time-series regression model was fitted on **{valCol}** to project values across the next 6 periods:
              </p>
              <div style={{ background: 'rgba(168, 85, 247, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {forecast.text}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Baseline intercept: {forecast.yIntercept?.toFixed(2)}</span>
                <span>Regression slope: {forecast.trendSlope?.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              No numeric column available to generate forecast modeling projections.
            </p>
          )}
        </div>
      )
    },
    {
      title: 'Integration & BI Configurations',
      subtitle: 'Scripts for Power BI & Databases',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            The generated dataset is normalized and ready for seamless database or BI tool imports:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <strong>SQL Table Struct:</strong> CREATE TABLE schema maps columns to proper datatypes (VARCHAR, DATE, INT, etc.).
            </div>
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--accent-purple)' }}>
              <strong>Power Query:</strong> Power BI M code configuration automatically typecasts columns on download.
            </div>
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--accent-emerald)' }}>
              <strong>Looker & Tableau:</strong> Auto-parsed ISO dates match BI dashboard date filters without manual corrections.
            </div>
          </div>
        </div>
      )
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-grid fade-in">
      
      {/* A. Presentation canvas slider */}
      <div className="dashboard-card-lg glass-panel glow-purple" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '340px' }}>
        
        {/* Slide Header */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Slide {activeSlide + 1} of {slides.length} — {slides[activeSlide].subtitle}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {slides.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === activeSlide ? 'var(--accent-purple)' : 'var(--bg-surface-elevated)' }} />
              ))}
            </div>
          </div>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            {slides[activeSlide].title}
          </h2>
          
          {/* Slide Content */}
          <div style={{ minHeight: '140px', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%' }}>
              {slides[activeSlide].content}
            </div>
          </div>
        </div>

        {/* Slide Footer navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button 
            disabled={activeSlide === 0} 
            onClick={() => setActiveSlide(prev => prev - 1)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          
          <button 
            onClick={() => {
              if (activeSlide === slides.length - 1) {
                setActiveSlide(0); // restart
              } else {
                setActiveSlide(prev => prev + 1);
              }
            }}
            className="btn btn-primary"
            style={{ padding: '6px 16px', fontSize: '0.8rem', background: 'var(--primary-gradient)' }}
          >
            {activeSlide === slides.length - 1 ? (
              <>
                <RefreshCw size={14} /> Restart Presentation
              </>
            ) : (
              <>
                Next Slide <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>

      {/* B. Executive summary printable page controls */}
      <div className="dashboard-card-sm glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--primary)" />
            Print Report Settings
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
            Compile your self-healing actions, visual dashboards, and forecast outputs into a single, cohesive PDF report suitable for presentation to executives or team stand-ups.
          </p>
        </div>

        <button 
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ width: '100%', display: 'flex', gap: '8px', padding: '10px 20px', background: 'var(--primary-gradient)' }}
        >
          <Printer size={16} />
          <span>Print Executive PDF</span>
        </button>

        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>Note: Print layout optimizes standard dashboards for horizontal pages. Margins are responsive.</span>
        </div>
      </div>

    </div>
  );
}
