/**
 * CENTRALIZED HOTEL WEBSOCKET SERVICE
 * v3.0 - December 2025 - Production Fix
 *
 * WebSocket is COMPLETELY DISABLED in production.
 * Only connects on localhost for development.
 */

// Check if we're on localhost BEFORE importing socket.io
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Only import socket.io if we're on localhost
let io = null;
if (isLocalhost) {
  io = require('socket.io-client').default;
}

class HotelWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.disabled = !isLocalhost; // Disabled if not on localhost
  }

  connect() {
    // PRODUCTION: Do nothing, return immediately
    if (!isLocalhost || !io) {
      return;
    }

    if (this.socket && this.connected) {
      return;
    }

    console.log('[WebSocket] Connecting to localhost:3001...');

    this.socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('[WebSocket] Connection failed - running offline');
        this.disconnect();
      }
    });

    this.socket.on('hotel-viewers-update', (data) => {
      this.notifyListeners(data.hotelId, 'viewers-update', data);
    });

    this.socket.on('booking-created', (data) => {
      this.notifyListeners(data.hotelId, 'booking-created', data);
    });

    this.socket.on('price-drop', (data) => {
      this.notifyListeners(data.hotelId, 'price-drop', data);
    });

    this.socket.on('availability-change', (data) => {
      this.notifyListeners(data.hotelId, 'availability-change', data);
    });
  }

  subscribe(hotelId, callback) {
    if (!hotelId || this.disabled) return () => {};

    if (!this.listeners.has(hotelId)) {
      this.listeners.set(hotelId, []);
    }
    this.listeners.get(hotelId).push(callback);

    return () => {
      const callbacks = this.listeners.get(hotelId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.listeners.delete(hotelId);
        }
      }
    };
  }

  notifyListeners(hotelId, eventType, data) {
    const callbacks = this.listeners.get(hotelId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(eventType, data);
        } catch (error) {
          console.error('[WebSocket] Callback error:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
const hotelWebSocketService = new HotelWebSocketService();

// Only connect on localhost
if (isLocalhost) {
  hotelWebSocketService.connect();
}

export default hotelWebSocketService;
