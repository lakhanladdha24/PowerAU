import { useState } from 'react';
import { Sparkles, HelpCircle, ArrowRight, CheckCircle, Settings, Shield } from 'lucide-react';

export default function AskWorkspace({ onSetProjectGoal }) {
  const [problemText, setProblemText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const sampleProblems = [
    {
      title: "Identify Churn Risk",
      desc: "Our subscription SaaS customer retention is declining month over month.",
      prompt: "Determine which customer accounts are at high risk of churning, identify the key drivers of cancellation, and establish preventative customer support interventions."
    },
    {
      title: "Forecast Next Quarter Sales",
      desc: "We need accurate weekly sales predictions to allocate inventory and marketing spend.",
      prompt: "Forecast weekly revenue for the next 90 days, analyze seasonal fluctuations, and isolate the impact of recent marketing campaign spends."
    },
    {
      title: "Analyze Student Performance Gaps",
      desc: "Evaluate exam results to identify subject areas where students need help.",
      prompt: "Identify student learning cohorts, highlight grades below threshold in core subjects, and map correlations with class attendance."
    }
  ];

  const handleSuggest = (prompt) => {
    setProblemText(prompt);
    handleAnalyze(prompt);
  };

  const handleAnalyze = (textToAnalyze = problemText) => {
    if (!textToAnalyze.trim()) return;
    setIsProcessing(true);
    setAnalysisResult(null);

    // Simulate AI parsing problem into structured objectives
    setTimeout(() => {
      let goal = "General Business Data Profiling";
      let kpis = ["Total Record Volume", "Completeness Rate", "Anomaly Index"];
      let columns = ["id", "timestamp", "value", "status"];
      let models = ["Descriptive Summary Statistics", "Isolation Forest Outlier Detection"];

      const lowerText = textToAnalyze.toLowerCase();
      if (lowerText.includes("churn") || lowerText.includes("retention") || lowerText.includes("cancellation")) {
        goal = "Predictive Subscription Churn Analysis & Risk Scoring";
        kpis = ["Monthly Churn Rate (%)", "Customer Lifetime Value (LTV)", "Login Frequency", "Support Ticket Volume"];
        columns = ["customer_id", "ClientFullName", "ClientEmailAddress", "Signup_Timestamp", "PaymentsVolume", "status", "phone"];
        models = ["Random Forest Classifier (Churn probability)", "Kaplan-Meier Survival Estimation", "SHAP Feature Importance Engine"];
      } else if (lowerText.includes("sales") || lowerText.includes("revenue") || lowerText.includes("forecast") || lowerText.includes("predict")) {
        goal = "Time-Series Revenue Forecasting & Attribution Modeling";
        kpis = ["Weekly Revenue Projection ($)", "Mean Absolute Percentage Error (MAPE)", "Marketing Channel ROI", "Quarterly Trend Vector"];
        columns = ["id", "Date", "Amount", "Payment_Method", "Item_Purchased", "Quantity"];
        models = ["Prophet Time-Series Forecasting Model", "Linear Regression (Trend analysis)", "Seasonality Decomposition"];
      } else if (lowerText.includes("student") || lowerText.includes("grade") || lowerText.includes("exam") || lowerText.includes("learn")) {
        goal = "Academic Cohort Segmentation & Attendance Attribution";
        kpis = ["Average Grade Performance", "Attendance Rate (%)", "Low Performance Churn Risk", "Subject Completion Rate"];
        columns = ["student_id", "StudentName", "Subject", "Score", "AttendancePercent", "Gender", "GradeLevel"];
        models = ["K-Means Clustering (Performance cohorts)", "Multiple Linear Regression", "Correlation Coefficients (Pearson)"];
      }

      setAnalysisResult({
        goal,
        kpis,
        columns,
        models,
        rawProblem: textToAnalyze
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleLockObjective = () => {
    if (!analysisResult) return;
    onSetProjectGoal({
      goalName: analysisResult.goal,
      kpis: analysisResult.kpis,
      expectedColumns: analysisResult.columns,
      models: analysisResult.models,
      rawProblem: analysisResult.rawProblem
    });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '32px 40px', position: 'relative', overflow: 'hidden' }}>
        <div className="hologram-grid-bg" />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ background: 'var(--primary-gradient)', padding: '6px', borderRadius: '6px', color: '#fff' }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stage 1 — Ask & Define</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            What business problem are we solving?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '640px', marginBottom: '24px' }}>
            PowerAU maps your plain-language goal to statistical models, target metrics, and structured datasets. Avoid building generic, cluttered dashboard grids.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g., We are losing subscribers in our SaaS. We need to identify who is at risk and why so we can prevent cancellation..."
              className="input-field"
              style={{
                flex: 1,
                minHeight: '80px',
                padding: '16px',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                resize: 'none',
                color: '#fff'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Press Submit to let the AI formulate the analytical framework.
            </span>
            <button
              onClick={() => handleAnalyze()}
              disabled={!problemText.trim() || isProcessing}
              className={`btn btn-primary`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isProcessing ? 'Formulating Framework...' : 'Formulate Objective'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {!analysisResult && !isProcessing && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
            Or choose a predefined industry template
          </h3>
          <div className="samples-grid">
            {sampleProblems.map((p, idx) => (
              <div key={idx} className="sample-card" onClick={() => handleSuggest(p.prompt)} style={{ cursor: 'pointer' }}>
                <h4 style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                  <HelpCircle size={14} />
                  {p.title}
                </h4>
                <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="anim-pulse" style={{ background: 'var(--primary-gradient)', padding: '16px', borderRadius: '50%', color: '#fff' }}>
            <Sparkles size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>PowerAU Architect Engine</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Synthesizing goal variables, selecting KPIs, and setting data structure constraints...</p>
          </div>
        </div>
      )}

      {analysisResult && !isProcessing && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-grid">
            {/* Goal Card */}
            <div className="dashboard-card-lg glass-panel glow-cyan" style={{ gridColumn: 'span 7', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CheckCircle size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>AI Analytical Objective</h3>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
                {analysisResult.goal}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Parsed business problem statement: <em>"{analysisResult.rawProblem}"</em>. The platform has automatically mapped this target to specialized downstream models.
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Target Predictive Models
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysisResult.models.map((mod, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Settings size={14} color="var(--text-muted)" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KPIs and Data Schema Requirement */}
            <div className="dashboard-card-sm glass-panel" style={{ gridColumn: 'span 5', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Core Recommended KPIs
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {analysisResult.kpis.map((kpi, i) => (
                    <span key={i} className="badge badge-cyan" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Recommended Data Field Map
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {analysisResult.columns.map((col, i) => (
                    <span key={i} style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                      {col}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Shield size={12} />
                  <span>Schema drift protection active for these variables.</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setAnalysisResult(null)}
            >
              Adjust Problem Definition
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleLockObjective}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Lock Objective & Collect Data
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
