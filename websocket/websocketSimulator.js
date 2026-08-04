/**
 * Simulated WebSocket Client-Server connection layer
 * Mimics an enterprise streaming endpoint (Kafka/MQTT/WebSocket) in-memory
 */
export class SimulatedWebSocket {
  constructor(options = {}) {
    this.url = options.url || 'ws://api.neuroflux.ai/stream';
    this.onMessageCallback = null;
    this.onStatusCallback = null;
    this.status = 'disconnected'; // disconnected, connecting, connected, error
    this.intervalId = null;
    this.messagesSent = 0;
    this.latency = 45; // ms
    this.bytesTransferred = 0;
    this.activeTopic = null;
  }

  connect(topic, onMessage, onStatus, frequency = 2000, generatorFunc) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.activeTopic = topic;
    this.onMessageCallback = onMessage;
    this.onStatusCallback = onStatus;
    this.setStatus('connecting');

    // Simulate connection delay
    setTimeout(() => {
      if (Math.random() < 0.05) {
        // 5% chance of connection error for resilience demonstration
        this.setStatus('error');
        if (this.onMessageCallback) {
          this.onMessageCallback({
            type: 'system_alert',
            timestamp: new Date().toISOString(),
            message: 'Handshake failed: Connection reset by peer.',
            severity: 'critical'
          });
        }
        return;
      }

      this.setStatus('connected');
      
      this.intervalId = setInterval(() => {
        if (this.status !== 'connected') return;

        // Dynamic network latency jitter
        this.latency = Math.max(12, Math.floor(this.latency + (Math.random() * 20 - 10)));
        
        // Generate new record
        const rawRecord = generatorFunc();
        this.messagesSent++;
        
        // Estimate bytes (approx length of stringified record)
        const size = JSON.stringify(rawRecord).length;
        this.bytesTransferred += size;

        if (this.onMessageCallback) {
          this.onMessageCallback({
            type: 'message',
            topic: this.activeTopic,
            offset: this.messagesSent,
            latency: this.latency,
            sizeBytes: size,
            timestamp: new Date().toISOString(),
            payload: rawRecord
          });
        }
      }, frequency);

    }, 800);
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.setStatus('disconnected');
    this.activeTopic = null;
  }

  setStatus(newStatus) {
    this.status = newStatus;
    if (this.onStatusCallback) {
      this.onStatusCallback({
        status: this.status,
        url: this.url,
        latency: this.latency,
        messagesSent: this.messagesSent,
        kbTransferred: (this.bytesTransferred / 1024).toFixed(2)
      });
    }
  }
}

export const webSocketManager = new SimulatedWebSocket();
