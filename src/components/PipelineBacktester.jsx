import { useState } from 'react';
import { Play, Sparkles, TrendingUp, CheckCircle, Cpu, Award } from 'lucide-react';
import { generateMessySample, parseCSV, inferSchema, auditData, healData } from '../utils/healingEngine';

export default function PipelineBacktester({ 
  activeDatasetName, 
  activeDatasetContent, 
  onApplyStrategy 
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);

  const runBacktest = async () => {
    setIsRunning(true);
    
    // Allow UI to render loading state
    await new Promise(resolve => setTimeout(resolve, 600));

    const datasetsToTest = [
      { name: 'E-Commerce Sales Raw', type: 'ecommerce', data: generateMessySample('ecommerce').data },
      { name: 'Customer Directory Messy', type: 'customer', data: generateMessySample('customer').data },
      { name: 'IoT Sensor Telemetry Logs', type: 'iot', data: generateMessySample('iot').data }
    ];

    // If there is an active uploaded custom dataset, include it!
    if (activeDatasetName && activeDatasetContent) {
      // Check if it's already one of the pre-packaged ones to avoid duplication
      const isPrepackaged = ['ecommerce_sales_raw.csv', 'customer_directory_corrupt.csv', 'iot_sensor_raw.csv'].includes(activeDatasetName);
      if (!isPrepackaged) {
        datasetsToTest.push({
          name: `Active: ${activeDatasetName}`,
          type: 'custom',
          data: activeDatasetContent
        });
      }
    } else {
      // Let's check if we can fetch the student dataset from public dir
      try {
        const response = await fetch('/Unclean Dataset.csv');
        if (response.ok) {
          const text = await response.text();
          datasetsToTest.push({
            name: 'Kaggle Student Dataset',
            type: 'student',
            data: text
          });
        }
      } catch (err) {
        console.warn("Kaggle dataset fetch skipped for backtest sweep:", err);
      }
    }

    const strategies = ['mean', 'median', 'mode'];
    const results = [];

    datasetsToTest.forEach(dataset => {
      const datasetResult = {
        name: dataset.name,
        type: dataset.type,
        dataSize: dataset.data.length,
        strategies: {}
      };

      // 1. Initial Profile (Common across all strategies)
      const parsedRaw = parseCSV(dataset.data);
      const inferredSchema = inferSchema(parsedRaw.headers, parsedRaw.rows);
      const rawAudit = auditData(parsedRaw.headers, parsedRaw.rows, inferredSchema);
      datasetResult.initialScore = rawAudit.globalQualityScore;
      datasetResult.rowCount = parsedRaw.rows.length;
      datasetResult.colCount = parsedRaw.headers.length;

      // 2. Test each Imputation Strategy
      strategies.forEach(strat => {
        const startTime = performance.now();

        // Run self-healing with the strategy
        const healResult = healData(
          parsedRaw.headers, 
          parsedRaw.rows, 
          inferredSchema, 
          { imputeNumeric: strat }
        );

        // Run audit on healed rows
        const healedAudit = auditData(parsedRaw.headers, healResult.healedRows, inferredSchema);
        const endTime = performance.now();

        // Count missing values filled
        const emptyFilled = healResult.changes.filter(c => 
          c.type === 'Imputed Value (No Blanks)' || c.type === 'Imputed Value'
        ).length;

        // Count type mismatch/formatting errors repaired
        const errorsHealed = healResult.changes.filter(c => 
          c.type.startsWith('Cast') || 
          c.type.startsWith('Healed Invalid') || 
          c.type.includes('Normalized') ||
          c.type.includes('Aligned') ||
          c.type.includes('Split')
        ).length;

        datasetResult.strategies[strat] = {
          finalScore: healedAudit.globalQualityScore,
          emptyFilled,
          errorsHealed,
          timeMs: Math.round((endTime - startTime) * 100) / 100,
          changesCount: healResult.changes.length
        };
      });

      // Determine best strategy
      let bestStrat = 'mean';
      let maxScore = -1;
      strategies.forEach(strat => {
        const score = datasetResult.strategies[strat].finalScore;
        if (score > maxScore) {
          maxScore = score;
          bestStrat = strat;
        } else if (score === maxScore) {
          // Tiebreaker: more changes applied (or faster)
          if (datasetResult.strategies[strat].changesCount > datasetResult.strategies[bestStrat].changesCount) {
            bestStrat = strat;
          }
        }
      });
      datasetResult.bestStrategy = bestStrat;

      results.push(datasetResult);
    });

    setBacktestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="glass-panel fade-in glow-purple" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--accent-purple)" />
            Data Quality Pipeline Backtester
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Simulate and benchmark Mean, Median, and Mode imputation strategies across multiple datasets in real-time.
          </p>
        </div>

        <button 
          onClick={runBacktest} 
          disabled={isRunning}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary-gradient)' }}
        >
          {isRunning ? (
            <>
              <Cpu size={16} className="anim-spin" />
              <span>Backtesting Sweep...</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Run Pipeline Backtest Sweep</span>
            </>
          )}
        </button>
      </div>

      {isRunning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '30px', textAlign: 'center' }}>
          <div className="anim-pulse" style={{ padding: '12px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>
            <Cpu size={24} className="anim-spin" />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Processing strategies across testing datasets...</span>
        </div>
      )}

      {backtestResults && !isRunning && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="samples-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {backtestResults.map(res => (
              <div key={res.name} className="sample-card" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', cursor: 'default', transform: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', fontWeight: '700' }}>{res.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Size: {res.rowCount} rows × {res.colCount} cols | Initial Score: {res.initialScore}%
                    </span>
                  </div>
                  <span className="badge badge-purple" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 8px', fontSize: '0.7rem' }}>
                    <Award size={12} />
                    <span>Best: {res.bestStrategy.toUpperCase()}</span>
                  </span>
                </div>

                <div className="data-table-container" style={{ border: 'none', background: 'transparent' }}>
                  <table className="data-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Imputation</th>
                        <th>Quality</th>
                        <th>Filled</th>
                        <th>Errors Healed</th>
                        <th>Speed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['mean', 'median', 'mode'].map(strat => {
                        const stratRes = res.strategies[strat];
                        const isBest = res.bestStrategy === strat;
                        return (
                          <tr key={strat} style={{ background: isBest ? 'rgba(168, 85, 247, 0.05)' : 'transparent' }}>
                            <td style={{ fontWeight: '600', color: isBest ? 'var(--accent-purple)' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
                              {strat} {isBest && '⭐'}
                            </td>
                            <td style={{ fontWeight: '700', color: stratRes.finalScore >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                              {stratRes.finalScore}%
                            </td>
                            <td>{stratRes.emptyFilled}</td>
                            <td>{stratRes.errorsHealed}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{stratRes.timeMs}ms</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Recommendations and actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <CheckCircle size={12} color="var(--accent-emerald)" />
                    <span>Quality improved by +{res.strategies[res.bestStrategy].finalScore - res.initialScore}%</span>
                  </span>
                  
                  {activeDatasetName && res.name.includes(activeDatasetName) && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['mean', 'median', 'mode'].map(strat => (
                        <button
                          key={strat}
                          onClick={() => onApplyStrategy(strat)}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.65rem', borderRadius: '4px', textTransform: 'capitalize' }}
                        >
                          Use {strat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Sparkles size={20} color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h5 style={{ fontWeight: '700', color: '#fff', fontSize: '0.85rem' }}>Backtesting Insight Report</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                Different imputation strategies impact the pipeline differently. For datasets with massive outliers (e.g. IoT Sensor logs with extreme temperatures), the <strong>Median</strong> strategy prevents distorting the distribution. For categorical-heavy numerical identifiers (e.g., student IDs, binary indicators), the <strong>Mode</strong> strategy maintains exact representation. For standard uniformly distributed errors, the <strong>Mean</strong> strategy provides maximum statistical balance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
