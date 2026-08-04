import { useState, useEffect } from 'react';
import { Sparkles, Send, ArrowRight } from 'lucide-react';

export default function RealTimeCopilot({ domain, dataHistory, anomalies }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize drawer with agent greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          sender: 'ai',
          text: `Hello! I am your PowerAU Live AI Analyst. I am monitoring the active **${domain.toUpperCase()}** telemetry feed. Ask me to explain anomalies, forecast values, or run a root-cause audit on current data.`
        }
      ]);
    }, 0);
    return () => clearTimeout(timer);
  }, [domain]);

  const suggestions = {
    stocks: [
      'Why are buy signals active right now?',
      'Explain current Bollinger Bands divergence',
      'Forecast price trend for the next 10 periods'
    ],
    iot: [
      'Why is robotic arm status changing?',
      'Check telemetry anomalies and failure risk',
      'Recommend optimal current/voltage levels'
    ],
    sales: [
      'Why did revenue drop today?',
      'Analyze inventory depletion rate',
      'Generate business forecast report'
    ],
    logistics: [
      'Analyze fleet speed violations',
      'Are there any GPS tracking route drifts?',
      'Give fuel economy recommendations'
    ]
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response generation after delay
    setTimeout(() => {
      const response = generateAIInsight(domain, text, dataHistory, anomalies);
      setMessages(prev => [...prev, { sender: 'ai', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: '400px' }}>
      
      {/* Copilot Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ background: 'var(--primary-gradient)', padding: '6px', borderRadius: '6px', color: '#fff' }}>
          <Sparkles size={16} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Live AI Copilot & Root-Cause Engine</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Continuous context analysis</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          maxHeight: '260px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          paddingRight: '4px',
          minHeight: '200px'
        }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
              color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
              padding: '10px 14px',
              borderRadius: '12px',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
              fontSize: '0.75rem',
              lineHeight: '1.4'
            }}
          >
            <p style={{ margin: 0, color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)' }}>
              {msg.text}
            </p>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            AI is analyzing stream buffers...
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Suggested Queries:</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {suggestions[domain]?.map((sug, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(sug)}
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-secondary)', 
                padding: '6px 10px', 
                borderRadius: '6px', 
                fontSize: '0.7rem', 
                textAlign: 'left', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              className="btn-secondary"
            >
              <span>{sug}</span>
              <ArrowRight size={10} style={{ marginLeft: '8px' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <input 
          type="text" 
          placeholder="Ask a stream query..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          className="input-field"
          style={{ flex: 1, fontSize: '0.75rem', background: 'var(--bg-surface-elevated)' }}
        />
        <button 
          onClick={() => handleSend(input)}
          className="btn btn-primary"
          style={{ padding: '8px 12px' }}
        >
          <Send size={12} />
        </button>
      </div>

    </div>
  );
}

/**
 * Heuristic generator for real-time copilot insights
 * Extracts recent statistics from stream history to form descriptive, authentic responses
 */
function generateAIInsight(domain, query, history, anomalies) {
  const q = query.toLowerCase();
  const current = history[history.length - 1] || {};
  const sampleCount = history.length;

  // 1. STOCKS COPIOT ANSWERS
  if (domain === 'stocks') {
    if (q.includes('signal') || q.includes('buy')) {
      return `Currently, the buy signal is **${current.signal}**. Our technical oscillator analysis shows RSI is at **${current.rsi?.toFixed(1)}** and MACD divergence is **${current.macd?.toFixed(3)}**. Signals are determined by tracking whether RSI falls below 30 (oversold) and MACD crosses above the signal line.`;
    }
    if (q.includes('bollinger') || q.includes('divergence')) {
      return `The latest price of **$${current.price?.toFixed(2)}** is trading relative to Bollinger bands: Upper **$${current.bollingerUpper?.toFixed(2)}** and Lower **$${current.bollingerLower?.toFixed(2)}**. Bollinger Bands track price volatility (2 standard deviations around moving average). A squeeze suggests compression preceding an breakout event.`;
    }
    if (q.includes('forecast')) {
      const slope = (current.price - history[Math.max(0, history.length - 10)].price) / 10;
      const forecastVal = current.price + slope * 10;
      return `Linear trend projection based on past ${Math.min(10, history.length)} intervals: Slope is **${slope.toFixed(4)}** per step. Projected price in 10 periods is **$${forecastVal.toFixed(2)}**. Note: Market trends are subject to sudden option PCR triggers (current PCR: **${current.pcr?.toFixed(2)}**).`;
    }
  }

  // 2. IOT MANUFACTURING COPIOT ANSWERS
  if (domain === 'iot') {
    if (q.includes('status') || q.includes('changing') || q.includes('failure')) {
      if (current.temperature > 85.0) {
        return `Robotic arm ROBOTIC_ARM_04 is currently in a **${current.status}** state. This is driven by high telemetry temperature of **${current.temperature?.toFixed(1)}°C** and pressure of **${current.pressure?.toFixed(1)} PSI**. The failure prediction probability has risen to **${current.failurePrediction}**.`;
      }
      return `Robotic arm status is **Operational**. Failure risk is low (**${current.failurePrediction}**). Telemetry parameters are well within control limits: Temp **${current.temperature?.toFixed(1)}°C**, Pressure **${current.pressure?.toFixed(1)} PSI**.`;
    }
    if (q.includes('anomaly') || q.includes('check')) {
      const anoms = anomalies.filter(a => a.timestamp > Date.now() - 30000);
      if (anoms.length > 0) {
        return `We have detected **${anoms.length}** anomalies in the last 30 seconds. Root Cause: Temperature values spiked, exceeding the standard threshold. Action: Check coolant valves on robotic arm.`;
      }
      return `No telemetry anomalies have been flagged in the active buffer. All voltage levels (currently **${current.voltage?.toFixed(0)}V**) and current load (**${current.current?.toFixed(1)}A**) are stable.`;
    }
    if (q.includes('recommend')) {
      return `Recommended settings: 1) Keep operational temperature below **82°C** by adjusting liquid coolant cycles. 2) Maintain voltage load at **220V ± 5%**. 3) Target motor current load at **15.0A** to optimize actuator lifecycle.`;
    }
  }

  // 3. SALES COPIOT ANSWERS
  if (domain === 'sales') {
    if (q.includes('revenue drop') || q.includes('drop today') || q.includes('why did')) {
      // Check if there was a revenue anomaly (discount code glitch) in recent logs
      const glitchedTxn = history.slice(-10).find(h => h.revenue < 100 && h.product.includes('AP'));
      if (glitchedTxn) {
        return `Root Cause: A discount glitch occurred on transaction **${glitchedTxn.orderId}**. The pricing engine processed the **${glitchedTxn.product}** at a 95% discount ($${glitchedTxn.revenue.toFixed(2)} instead of original price), causing a temporary drop in rolling margins.`;
      }
      return `Revenue is stable. Current cumulative session revenue is **$${current.rollingRevenue?.toLocaleString()}**. No pricing anomalies or transaction drops have been flagged in the active queue.`;
    }
    if (q.includes('inventory') || q.includes('depletion')) {
      return `Current inventory level is **${current.inventoryLevel} units**. With a rolling order quantity average of **x${current.quantity}** per event, depletion rate is sustainable. Auto-replenishment (+400 units) will trigger if stock falls below 50.`;
    }
    if (q.includes('forecast') || q.includes('report')) {
      const avgRevenue = history.reduce((sum, h) => sum + h.revenue, 0) / sampleCount;
      return `Active Business Forecast: Averaging **$${avgRevenue.toFixed(2)}** per order over ${sampleCount} completed sales. Projecting sales revenue to cross **$${(current.rollingRevenue + avgRevenue * 15).toLocaleString(undefined, { maximumFractionDigits: 0 })}** by end of business cycle.`;
    }
  }

  // 4. LOGISTICS COPIOT ANSWERS
  if (domain === 'logistics') {
    if (q.includes('speed') || q.includes('violation')) {
      const speeders = history.filter(h => h.speed > 80);
      if (speeders.length > 0) {
        return `Alert: Vehicle **TRUCK_FL-889** exceeded the speed threshold (80 mph) **${speeders.length} times** in this session, reaching a peak of **${Math.max(...speeders.map(s => s.speed)).toFixed(1)} mph**. Dispatch notice recommended.`;
      }
      return `No speed violations flagged. Fleet vehicle is traveling at an average speed of **${(history.reduce((a, b) => a + b.speed, 0) / sampleCount).toFixed(1)} mph** (last reading: **${current.speed?.toFixed(1)} mph**).`;
    }
    if (q.includes('gps') || q.includes('drift') || q.includes('route')) {
      return `GPS positioning coordinates are Lat: **${current.gpsLatitude?.toFixed(5)}**, Long: **${current.gpsLongitude?.toFixed(5)}**. The telemetry stream indicates the fleet vehicle is tracking perfectly along the **${current.route}** corridor without any route drift anomalies.`;
    }
    if (q.includes('fuel') || q.includes('recommend')) {
      return `Vessel fuel reservoir is at **${current.fuelLevel?.toFixed(1)}%**. Recommendations: Adjust speed to target **55-60 mph** cruising window. Drag loads on highways increase fuel depletion rate by up to 22% when traveling above 72 mph.`;
    }
  }

  return `I have analyzed the current stream packet containing **${sampleCount} records**. There are no explicit deviations corresponding to '${query}'. Let me know if you would like me to audit another metric.`;
}
