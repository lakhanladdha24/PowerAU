import { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  BarChart, 
  Bar 
} from 'recharts';
import { ShieldAlert, Activity, DollarSign, Cpu, MapPin, Gauge } from 'lucide-react';

/**
 * Main switch-panel for domain-specific live dashboards
 */
export default function LiveDashboards({ domain, dataHistory, anomalies }) {
  const recentAnomalies = useMemo(() => {
    return anomalies.slice(-5).reverse();
  }, [anomalies]);

  if (!dataHistory || dataHistory.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Activity size={32} style={{ marginBottom: '12px' }} className="anim-pulse" />
        <p>Awaiting live connection stream telemetry...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dynamic Dashboard Domain Selection */}
      {domain === 'stocks' && <StockMarketDashboard history={dataHistory} />}
      {domain === 'iot' && <ManufacturingDashboard history={dataHistory} />}
      {domain === 'sales' && <SalesDashboard history={dataHistory} />}
      {domain === 'logistics' && <LogisticsDashboard history={dataHistory} />}

      {/* Stream Anomalies & Alerts Log */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} color="var(--accent-rose)" />
          Stream Auditing Log: Live Anomalies & Schema Integrity
        </h3>
        
        {recentAnomalies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentAnomalies.map((anom, i) => (
              <div 
                key={i} 
                className="fade-in"
                style={{ 
                  background: 'rgba(244, 63, 94, 0.05)', 
                  border: '1px solid rgba(244, 63, 94, 0.15)', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  fontSize: '0.75rem',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}
              >
                <div>
                  <span style={{ fontWeight: '700', color: 'var(--accent-rose)', marginRight: '8px' }}>[ANOMALY]</span>
                  <span style={{ color: 'var(--text-primary)' }}>{anom.reason}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  {new Date(anom.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', textTransform: 'uppercase', textAlign: 'center', fontSize: '0.7rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.03)', border: '1px dashed var(--accent-emerald)', borderRadius: '8px' }}>
            ✓ No validation or statistical schema anomalies flagged in active session
          </div>
        )}
      </div>

    </div>
  );
}

// ----------------------------------------------------
// 1. Stock Market Live Dashboard Component
// ----------------------------------------------------
function StockMarketDashboard({ history }) {
  const current = history[history.length - 1] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Stock KPIs */}
      <div className="dashboard-grid">
        <div className="dashboard-card-sm glass-panel glow-cyan" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Last Price (NFLX)</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            ${current.price?.toFixed(2)}
          </div>
          <span className={`badge ${current.price >= history[Math.max(0, history.length - 2)]?.price ? 'badge-emerald' : 'badge-rose'}`} style={{ marginTop: '6px', fontSize: '0.65rem' }}>
            {current.price >= history[Math.max(0, history.length - 2)]?.price ? '▲ Rising' : '▼ Falling'}
          </span>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>VWAP (Intraday)</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            ${current.vwap?.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Volume Weighted Price</div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Put-Call Ratio (PCR)</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.pcr?.toFixed(2)}
          </div>
          <span className={`badge ${current.pcr > 1.0 ? 'badge-rose' : 'badge-emerald'}`} style={{ marginTop: '6px', fontSize: '0.65rem' }}>
            {current.pcr > 1.0 ? 'Bearish Sentiment' : 'Bullish Sentiment'}
          </span>
        </div>

        <div className="dashboard-card-sm glass-panel glow-primary" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Market AI Signal</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-purple)' }}>
            {current.signal}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>RSI / MACD Oscillator</div>
        </div>
      </div>

      {/* Stock Charts */}
      <div className="dashboard-grid">
        <div className="dashboard-card-lg glass-panel" style={{ gridColumn: 'span 8', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} color="var(--primary)" /> Price Trend & Bollinger Bands (Live)
          </h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.slice(-30)}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="offset" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="price" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                <Line type="monotone" dataKey="bollingerUpper" stroke="var(--accent-amber)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="bollingerLower" stroke="var(--accent-amber)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ gridColumn: 'span 4', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px' }}>RSI Momentum Oscillator</h3>
          <div style={{ width: '100%', height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice(-25)}>
                <XAxis dataKey="offset" stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={8} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.7rem' }} />
                <Line type="monotone" dataKey="rsi" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            <span>Oversold: &lt;30</span>
            <span>Overbought: &gt;70</span>
          </div>
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// 2. Manufacturing Live Dashboard Component
// ----------------------------------------------------
function ManufacturingDashboard({ history }) {
  const current = history[history.length - 1] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* IoT KPIs */}
      <div className="dashboard-grid">
        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Temperature</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.temperature?.toFixed(1)}°C
          </div>
          <span className={`badge ${current.temperature > 85 ? 'badge-rose' : 'badge-emerald'}`} style={{ marginTop: '6px', fontSize: '0.65rem' }}>
            {current.temperature > 85 ? 'Overheat' : 'Normal'}
          </span>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Current & Voltage</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.current?.toFixed(1)}A / {current.voltage?.toFixed(0)}V
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Real-time telemetry feeds</div>
        </div>

        <div className="dashboard-card-sm glass-panel glow-cyan" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Status</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.status}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Machine health report</div>
        </div>

        <div className="dashboard-card-sm glass-panel glow-rose" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Failure Prediction</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-rose)' }}>
            {current.failurePrediction}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>ML Classifier Output</div>
        </div>
      </div>

      {/* IoT Charts */}
      <div className="dashboard-grid">
        <div className="dashboard-card-lg glass-panel" style={{ gridColumn: 'span 8', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={14} color="var(--accent-cyan)" /> Real-Time Telemetry: Temperature vs Pressure
          </h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.slice(-30)}>
                <XAxis dataKey="offset" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="temperature" stroke="var(--accent-rose)" fill="rgba(244, 63, 94, 0.05)" strokeWidth={2} />
                <Area type="monotone" dataKey="pressure" stroke="var(--accent-cyan)" fill="rgba(6, 182, 212, 0.05)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ gridColumn: 'span 4', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px' }}>Current Draw Load</h3>
          <div style={{ width: '100%', height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history.slice(-15)}>
                <XAxis dataKey="offset" stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.7rem' }} />
                <Bar dataKey="current" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            Amperage draws over recent machine steps
          </div>
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// 3. Sales Live Dashboard Component
// ----------------------------------------------------
function SalesDashboard({ history }) {
  const current = history[history.length - 1] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Sales KPIs */}
      <div className="dashboard-grid">
        <div className="dashboard-card-sm glass-panel glow-emerald" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            ${current.rollingRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cumulative sales in session</div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Recent Transaction</div>
          <div className="metric-value" style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            +${current.revenue?.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {current.product} (x{current.quantity})
          </div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Inventory Stock</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.inventoryLevel} units
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Auto-replenishes &lt; 50</div>
        </div>

        <div className="dashboard-card-sm glass-panel glow-cyan" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Orders</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {history.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Processed transaction stream</div>
        </div>
      </div>

      {/* Sales Charts */}
      <div className="dashboard-grid">
        <div className="dashboard-card-lg glass-panel" style={{ gridColumn: 'span 8', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={14} color="var(--accent-emerald)" /> Cumulative Sales & Orders (Live)
          </h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.slice(-30)}>
                <XAxis dataKey="orderId" stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="rollingRevenue" stroke="var(--accent-emerald)" fill="rgba(16, 185, 129, 0.05)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ gridColumn: 'span 4', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px' }}>Transaction Size</h3>
          <div style={{ width: '100%', height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history.slice(-15)}>
                <XAxis dataKey="offset" stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.7rem' }} />
                <Bar dataKey="revenue" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            Revenue per individual checkout event
          </div>
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// 4. Logistics Live Dashboard Component
// ----------------------------------------------------
function LogisticsDashboard({ history }) {
  const current = history[history.length - 1] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Logistics KPIs */}
      <div className="dashboard-grid">
        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Active Fleet Vessel</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.vehicleId}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Route: {current.route}</div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Telemetry Speed</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.speed?.toFixed(1)} mph
          </div>
          <span className={`badge ${current.speed > 70 ? 'badge-rose' : 'badge-primary'}`} style={{ marginTop: '6px', fontSize: '0.65rem' }}>
            {current.speed > 70 ? 'Speeding Alert' : 'Transit'}
          </span>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Fuel Reservoir</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.fuelLevel?.toFixed(1)}%
          </div>
          <span className={`badge ${current.fuelLevel < 15 ? 'badge-rose' : 'badge-emerald'}`} style={{ marginTop: '6px', fontSize: '0.65rem' }}>
            {current.fuelLevel < 15 ? 'Low Fuel' : 'Optimal'}
          </span>
        </div>

        <div className="dashboard-card-sm glass-panel glow-cyan" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>ETA to Destination</div>
          <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
            {current.deliveryTimeMinutes} mins
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Adjusts based on speed</div>
        </div>
      </div>

      {/* Logistics Charts & Map */}
      <div className="dashboard-grid">
        <div className="dashboard-card-lg glass-panel" style={{ gridColumn: 'span 8', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} color="var(--primary)" /> GPS Navigation Mini-Map Coordinates (Live)
          </h3>
          <div style={{ height: '220px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            {/* Coordinate readout */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '14px', zIndex: 2 }}>
              <span>Latitude: <strong>{current.gpsLatitude?.toFixed(5)}</strong></span>
              <span>Longitude: <strong>{current.gpsLongitude?.toFixed(5)}</strong></span>
            </div>
            
            {/* Visual plot representation */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* Simulated path grid line */}
              <div style={{ width: '80%', height: '2px', background: 'rgba(255,255,255,0.06)', position: 'absolute' }} />
              {/* Moving truck node */}
              <div 
                style={{ 
                  position: 'absolute', 
                  width: '12px', 
                  height: '12px', 
                  background: 'var(--primary)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 12px var(--primary)',
                  left: `${50 + (current.gpsLongitude + 122.41) * 800}%`,
                  top: `${50 - (current.gpsLatitude - 37.77) * 800}%`,
                  transition: 'all 0.5s ease'
                }}
              />
              <span style={{ position: 'absolute', fontSize: '0.65rem', color: 'var(--text-muted)', bottom: 10 }}>[Route Corridor Transit Map View]</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card-sm glass-panel" style={{ gridColumn: 'span 4', padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={14} color="var(--accent-cyan)" /> Speed Profile (mph)
          </h3>
          <div style={{ width: '100%', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice(-20)}>
                <XAxis dataKey="offset" stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={8} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.7rem' }} />
                <Line type="monotone" dataKey="speed" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
