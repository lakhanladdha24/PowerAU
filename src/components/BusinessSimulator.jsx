import { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Sliders, TrendingUp, AlertTriangle } from 'lucide-react';
import { runScenarioSimulation } from '../utils/healingEngine';

export default function BusinessSimulator({ headers, rows, context }) {
  const [priceChangePct, setPriceChangePct] = useState(0);
  const [marketingBudgetChangePct, setMarketingBudgetChangePct] = useState(0);
  const [supportChangePct, setSupportChangePct] = useState(0);
  
  const simResult = useMemo(() => {
    return runScenarioSimulation(context, {
      priceChangePct,
      marketingBudgetChangePct,
      supportChangePct
    }, rows, headers);
  }, [context, priceChangePct, marketingBudgetChangePct, supportChangePct, rows, headers]);

  const handleResetSliders = () => {
    setPriceChangePct(0);
    setMarketingBudgetChangePct(0);
    setSupportChangePct(0);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Simulation Controls & Output Header */}
      <div className="dashboard-grid">
        
        {/* Sliders Input Panel */}
        <div className="dashboard-card-sm glass-panel glow-primary" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--primary)" />
            What-If Parameters
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Adjust operational sliders to simulate the elasticity on revenue, churn risk, and margins.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Slider 1: Price Change */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Price Adjustment</span>
                <span style={{ fontWeight: '700', color: priceChangePct > 0 ? 'var(--accent-emerald)' : priceChangePct < 0 ? 'var(--accent-rose)' : '#fff' }}>
                  {priceChangePct >= 0 ? `+${priceChangePct}%` : `${priceChangePct}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-30" 
                max="50" 
                value={priceChangePct} 
                onChange={(e) => setPriceChangePct(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Price increases drive churn exponentially</span>
            </div>

            {/* Slider 2: Marketing budget */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Marketing Budget</span>
                <span style={{ fontWeight: '700', color: marketingBudgetChangePct > 0 ? 'var(--accent-emerald)' : marketingBudgetChangePct < 0 ? 'var(--accent-rose)' : '#fff' }}>
                  {marketingBudgetChangePct >= 0 ? `+${marketingBudgetChangePct}%` : `${marketingBudgetChangePct}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-50" 
                max="100" 
                value={marketingBudgetChangePct} 
                onChange={(e) => setMarketingBudgetChangePct(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Marketing shifts acquisition volume</span>
            </div>

            {/* Slider 3: Customer Support */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Support Allocation</span>
                <span style={{ fontWeight: '700', color: supportChangePct > 0 ? 'var(--accent-emerald)' : supportChangePct < 0 ? 'var(--accent-rose)' : '#fff' }}>
                  {supportChangePct >= 0 ? `+${supportChangePct}%` : `${supportChangePct}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-50" 
                max="100" 
                value={supportChangePct} 
                onChange={(e) => setSupportChangePct(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
              />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Support funding counteracts churn</span>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.75rem', padding: '6px 12px', marginTop: '4px' }}
            onClick={handleResetSliders}
          >
            Reset to Baseline
          </button>
        </div>

        {/* Comparison Output Dashboard */}
        <div style={{ gridColumn: 'span 9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Comparison Cards Row */}
          {simResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              
              {/* Card 1: Revenue */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Simulated Revenue</div>
                <div className="metric-value" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>
                  ${Math.round(simResult.simulated.revenue).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.65rem', color: simResult.simulated.revenue >= simResult.baseline.revenue ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '4px' }}>
                  {simResult.simulated.revenue >= simResult.baseline.revenue ? '▲' : '▼'} {Math.round(Math.abs((simResult.simulated.revenue - simResult.baseline.revenue) / simResult.baseline.revenue) * 100)}% vs Base
                </div>
              </div>

              {/* Card 2: Net Profit */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Simulated profit</div>
                <div className="metric-value" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>
                  ${Math.round(simResult.simulated.profit).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.65rem', color: simResult.simulated.profit >= simResult.baseline.profit ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '4px' }}>
                  {simResult.simulated.profit >= simResult.baseline.profit ? '▲' : '▼'} {Math.round(Math.abs((simResult.simulated.profit - simResult.baseline.profit) / simResult.baseline.profit) * 100)}% vs Base
                </div>
              </div>

              {/* Card 3: Churn Rate */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Simulated Churn</div>
                <div className="metric-value" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>
                  {simResult.simulated.churnRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.65rem', color: simResult.simulated.churnRate <= simResult.baseline.churnRate ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '4px' }}>
                  {simResult.simulated.churnRate <= simResult.baseline.churnRate ? '▼' : '▲'} {(simResult.simulated.churnRate - simResult.baseline.churnRate).toFixed(1)}% abs shift
                </div>
              </div>

              {/* Card 4: Inventory Needed */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Inventory Load</div>
                <div className="metric-value" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>
                  {Math.round(simResult.simulated.inventory).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>units</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Optimal stocking required
                </div>
              </div>

            </div>
          )}

          {/* Chart Display */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="var(--primary)" />
                Scenario Profitability Model comparison
              </h3>
              {simResult && (
                <span className={`badge ${simResult.riskClass}`}>
                  Outcome Risk: {simResult.riskRating}
                </span>
              )}
            </div>

            <div style={{ width: '100%', height: '220px', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '12px' }}>
              {simResult && simResult.charts ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simResult.charts} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                    />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line type="monotone" dataKey="BaselineProfit" name="Baseline Monthly Profit" stroke="var(--accent-cyan)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="SimulatedProfit" name="Simulated Monthly Profit" stroke="var(--accent-purple)" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Awaiting simulation result...
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 2. Simulation Summary Insights */}
      {simResult && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', background: simResult.riskRating === 'High Risk' ? 'rgba(244,63,94,0.02)' : 'rgba(16,185,129,0.02)', border: simResult.riskRating === 'High Risk' ? '1px solid rgba(244,63,94,0.15)' : '1px solid rgba(16,185,129,0.15)' }}>
          <div style={{ background: simResult.riskRating === 'High Risk' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '8px', color: simResult.riskRating === 'High Risk' ? 'var(--accent-rose)' : 'var(--accent-emerald)', flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>Simulation Prescriptive Diagnostics</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
              {priceChangePct > 15 ? (
                `Warning: A price increase of ${priceChangePct}% triggers an elastic demand drop. Simulated churn rate raises to ${simResult.simulated.churnRate.toFixed(1)}% (Base: 8.0%). While initial revenue appears higher, net operational margins may decay unless combined with a matching ${Math.round(priceChangePct * 1.2)}% marketing customer support buffer to safeguard retention metrics.`
              ) : priceChangePct === 0 && marketingBudgetChangePct === 0 && supportChangePct === 0 ? (
                `Operational margins are stable. The current baseline model projects a net annual profit of $${Math.round(simResult.baseline.profit).toLocaleString()} with standard inventory requirements of ${simResult.baseline.inventory} units.`
              ) : (
                `Optimized scenario confirmed. The adjusted parameters project a net profit shift of $${Math.round(simResult.simulated.profit - simResult.baseline.profit).toLocaleString()} (${simResult.simulated.profit >= simResult.baseline.profit ? '+' : '-'}${Math.round(Math.abs((simResult.simulated.profit - simResult.baseline.profit) / simResult.baseline.profit) * 100)}%). Stocking guidelines indicate reducing or adjusting inventory by ${Math.round(Math.abs(100 - (simResult.simulated.inventory / simResult.baseline.inventory) * 100))}% to minimize warehousing overhead.`
              )}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
