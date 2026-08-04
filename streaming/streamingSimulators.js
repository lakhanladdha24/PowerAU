/**
 * Real-Time Telemetry and Event Stream Generators
 * Supports Stock Market, IoT Manufacturing, E-commerce Sales, and Logistics Fleet telemetry.
 */

// Global state trackers for moving averages / online stats
const streamState = {
  stocks: {
    price: 150.0,
    volume: 50000,
    history: [],
    vwapSum: 0,
    vwapVol: 0,
    pcr: 1.0,
    openInterest: 10000
  },
  iot: {
    temp: 72.0, // F
    pressure: 30.0,
    current: 15.0,
    voltage: 220.0,
    status: 'Operational',
    history: []
  },
  sales: {
    rollingRevenue: 0,
    orderCount: 0,
    inventory: 500,
    history: []
  },
  logistics: {
    speed: 55,
    gpsLat: 37.7749,
    gpsLong: -122.4194,
    history: []
  }
};

/**
 * Validates a streaming record against its predefined domain schema
 */
export function validateRecord(domain, record) {
  const errors = [];
  
  if (domain === 'stocks') {
    if (!record.ticker) errors.push('Missing ticker identifier');
    if (isNaN(record.price) || record.price <= 0) errors.push('Invalid market price');
    if (isNaN(record.volume) || record.volume < 0) errors.push('Invalid trade volume');
  } else if (domain === 'iot') {
    if (!record.machineId) errors.push('Missing machine ID');
    if (isNaN(record.temperature)) errors.push('Temperature must be numeric');
    if (isNaN(record.pressure) || record.pressure < 0) errors.push('Invalid pressure value');
  } else if (domain === 'sales') {
    if (!record.orderId) errors.push('Missing order transaction ID');
    if (isNaN(record.revenue) || record.revenue < 0) errors.push('Invalid transaction revenue');
  } else if (domain === 'logistics') {
    if (!record.vehicleId) errors.push('Missing vehicle registry ID');
    if (isNaN(record.speed) || record.speed < 0) errors.push('Speed must be positive');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Preprocesses and cleans a streaming record in real-time,
 * mimicking the project's historical self-healing rules
 */
export function cleanStreamingRecord(domain, record) {
  const cleaned = { ...record };

  // 1. Text Trimming & Normalization
  Object.keys(cleaned).forEach(key => {
    if (typeof cleaned[key] === 'string') {
      cleaned[key] = cleaned[key].trim();
    }
  });

  // 2. Numerical casting and default imputation
  if (domain === 'stocks') {
    cleaned.price = parseFloat(Number(cleaned.price).toFixed(2)) || 10.0;
    cleaned.volume = parseInt(cleaned.volume) || 100;
    cleaned.vwap = parseFloat(Number(cleaned.vwap).toFixed(2)) || cleaned.price;
  } else if (domain === 'iot') {
    cleaned.temperature = parseFloat(Number(cleaned.temperature).toFixed(1)) || 70.0;
    cleaned.pressure = parseFloat(Number(cleaned.pressure).toFixed(1)) || 30.0;
    cleaned.voltage = parseFloat(Number(cleaned.voltage).toFixed(1)) || 220.0;
  } else if (domain === 'sales') {
    cleaned.revenue = parseFloat(Number(cleaned.revenue).toFixed(2)) || 0.0;
    cleaned.quantity = parseInt(cleaned.quantity) || 1;
  } else if (domain === 'logistics') {
    cleaned.speed = parseFloat(Number(cleaned.speed).toFixed(1)) || 50.0;
    cleaned.fuelLevel = Math.max(0, Math.min(100, parseFloat(Number(cleaned.fuelLevel).toFixed(1)) || 100.0));
  }

  return cleaned;
}

/**
 * Online Anomaly Detection Engine
 * Uses rolling stats to check for values beyond standard deviations
 */
export function detectStreamAnomaly(domain, record) {
  const state = streamState[domain];
  let isAnomaly = false;
  let reason = '';

  state.history.push(record);
  if (state.history.length > 50) state.history.shift();

  if (domain === 'stocks') {
    // Flag if RSI indicates overbought/oversold (>80 or <20)
    if (record.rsi > 80) {
      isAnomaly = true;
      reason = `Market RSI is ${record.rsi.toFixed(1)}: Overbought asset warning.`;
    } else if (record.rsi < 20) {
      isAnomaly = true;
      reason = `Market RSI is ${record.rsi.toFixed(1)}: Oversold asset capitulation.`;
    }
  } else if (domain === 'iot') {
    // Flag if temperature rises above 92C or pressure exceeds 45 PSI
    if (record.temperature > 90.0) {
      isAnomaly = true;
      reason = `Critical temperature threshold reached: ${record.temperature}°C. Risk of engine block failure.`;
    }
    if (record.pressure > 44.0) {
      isAnomaly = true;
      reason = `High pressure warning: ${record.pressure} PSI. Exceeds standard operating limit.`;
    }
  } else if (domain === 'sales') {
    // Calculate mean of past sales. Flag if revenue drops below 40% of the mean (outlier dip)
    const prevSales = state.history.slice(0, -1).map(h => h.revenue);
    if (prevSales.length >= 10) {
      const avgSales = prevSales.reduce((a, b) => a + b, 0) / prevSales.length;
      if (record.revenue < avgSales * 0.4) {
        isAnomaly = true;
        reason = `Revenue anomaly: Drop of ${(100 - (record.revenue / avgSales) * 100).toFixed(0)}% from rolling mean ($${avgSales.toFixed(2)}).`;
      }
    }
  } else if (domain === 'logistics') {
    // Flag speed limit violations or extreme speed drops
    if (record.speed > 80) {
      isAnomaly = true;
      reason = `Speed violation: Fleet vessel traveling at ${record.speed} mph.`;
    }
  }

  return { isAnomaly, reason };
}

// ----------------------------------------------------
// Telemetry Generators
// ----------------------------------------------------

export function generateStockRecord() {
  const state = streamState.stocks;
  
  // Random walk for stock price
  const changePercent = (Math.random() * 2 - 0.98) / 100; // slight upward drift
  state.price = state.price * (1 + changePercent);
  
  // Trade volume
  const volChange = Math.floor(Math.random() * 4000 - 2000);
  state.volume = Math.max(500, state.volume + volChange);

  // VWAP calculation
  state.vwapSum += state.price * state.volume;
  state.vwapVol += state.volume;
  const vwap = state.vwapSum / state.vwapVol;

  // Technical Indicators
  // RSI: oscillate between 15 and 85
  const minutes = new Date().getMinutes();
  const baseRsi = 50 + Math.sin(minutes / 5) * 25;
  const rsi = Math.max(10, Math.min(90, baseRsi + (Math.random() * 10 - 5)));

  // MACD: Fast/Slow line difference
  const macd = Math.sin(minutes / 10) * 2.5 + (Math.random() * 0.4 - 0.2);

  // Bollinger Bands
  const bUpper = state.price + 8.5 + Math.sin(minutes / 8) * 2;
  const bLower = state.price - 8.5 - Math.sin(minutes / 8) * 2;

  // Open Interest & Put-Call Ratio
  state.openInterest += Math.floor(Math.random() * 100 - 45);
  state.pcr = Math.max(0.4, Math.min(1.8, state.pcr + (Math.random() * 0.1 - 0.05)));

  // AI Signals
  let signal = 'HOLD';
  if (rsi < 30 && macd > -0.5) signal = 'BUY';
  else if (rsi > 70 && macd < 0.5) signal = 'SELL';

  return {
    ticker: 'NFLX',
    price: state.price,
    volume: state.volume,
    vwap,
    rsi,
    macd,
    bollingerUpper: bUpper,
    bollingerLower: bLower,
    openInterest: state.openInterest,
    pcr: state.pcr,
    signal
  };
}

export function generateIoTRecord() {
  const state = streamState.iot;

  // 4% chance of entering anomaly cycle
  const minutes = new Date().getMinutes();
  const isPeakHour = minutes % 15 === 0;

  let tempJitter = Math.random() * 2 - 1.0;
  if (isPeakHour) {
    tempJitter += 1.5; // push temperature up during peaks
  }
  state.temp = Math.max(60.0, Math.min(110.0, state.temp + tempJitter));

  // Temperature correlates with pressure
  state.pressure = state.temp * 0.4 + (Math.random() * 4 - 2);

  // Electrics
  state.current = 12.0 + Math.sin(minutes / 4) * 3 + (Math.random() * 1 - 0.5);
  state.voltage = 220.0 + (Math.random() * 10 - 5);

  // Status mapping
  let status = 'Operational';
  let failurePrediction;
  const failureProb = (state.temp - 60.0) / 50.0; // scale prob based on temperature

  if (state.temp > 90.0) {
    status = 'Overheating';
    failurePrediction = `${(failureProb * 100).toFixed(1)}%`;
  } else if (state.temp > 82.0) {
    status = 'Warning';
    failurePrediction = `${(failureProb * 100).toFixed(1)}%`;
  } else {
    failurePrediction = `${(Math.max(0.01, failureProb) * 15).toFixed(1)}%`;
  }

  // Artificial injection of a transient error
  if (Math.random() < 0.03) {
    state.voltage = 110.0; // sudden voltage sag
    status = 'Degraded Power';
  }

  return {
    machineId: 'ROBOTIC_ARM_04',
    temperature: state.temp,
    pressure: state.pressure,
    current: state.current,
    voltage: state.voltage,
    status,
    failurePrediction
  };
}

export function generateSalesRecord() {
  const state = streamState.sales;

  // Simulate orders
  state.orderCount++;
  
  // Random product category selection
  const products = [
    { name: 'Core AI Processing Unit', price: 1200.0 },
    { name: 'Edge Telemetry Module', price: 350.0 },
    { name: 'SaaS Stream Connector', price: 99.0 },
    { name: 'NeuroFlux Dev License', price: 499.0 },
    { name: 'API Access Key (Enterprise)', price: 2500.0 }
  ];

  // 3% chance of a massive price drop / discount code glitch (leads to revenue drop anomaly)
  const isDiscountGlitch = Math.random() < 0.03;

  const product = products[Math.floor(Math.random() * products.length)];
  const qty = Math.floor(Math.random() * 3) + 1;
  let revenue = product.price * qty;

  if (isDiscountGlitch) {
    revenue = revenue * 0.05; // 95% discount glitch!
  }

  state.rollingRevenue += revenue;
  
  // Inventory depletion & restock
  state.inventory -= qty;
  if (state.inventory < 50) {
    state.inventory += 400; // automatic restock event
  }

  const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America'];

  return {
    orderId: `TXN-${100000 + state.orderCount}`,
    customerId: `USR-${Math.floor(Math.random() * 9000 + 1000)}`,
    product: product.name,
    quantity: qty,
    revenue,
    inventoryLevel: state.inventory,
    region: regions[Math.floor(Math.random() * regions.length)],
    rollingRevenue: state.rollingRevenue
  };
}

export function generateLogisticsRecord() {
  const state = streamState.logistics;

  // Speed jitter
  state.speed = Math.max(0, Math.min(90, state.speed + (Math.random() * 6 - 3)));

  // Drive GPS coordinates along a path (e.g. SF to San Jose)
  state.gpsLat += (Math.random() * 0.02 - 0.009);
  state.gpsLong += (Math.random() * 0.02 - 0.011);

  // Fuel depletion
  const fuelRate = state.speed > 0 ? (state.speed / 200) : 0.05;
  const currentFuel = Math.max(5.0, 100.0 - (new Date().getMinutes() * fuelRate * 2.5) % 95);

  const fleetStatus = state.speed === 0 ? 'Stationary' : state.speed > 70 ? 'Speeding' : 'Transit';
  
  // Estimated delivery time
  const etaMins = Math.max(5, 60 - Math.floor(state.speed * 0.5) + Math.floor(Math.random() * 6 - 3));

  return {
    vehicleId: 'TRUCK_FL-889',
    route: 'SF-OAK-SJC-CORRIDOR',
    speed: state.speed,
    gpsLatitude: state.gpsLat,
    gpsLongitude: state.gpsLong,
    fuelLevel: currentFuel,
    status: fleetStatus,
    deliveryTimeMinutes: etaMins
  };
}
