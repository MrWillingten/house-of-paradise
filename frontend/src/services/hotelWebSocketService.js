/**
 * CENTRALIZED HOTEL WEBSOCKET SERVICE
 * v2.0 - December 2025 - Production Fix
 *
 * Manages a single WebSocket connection for all hotel real-time updates.
 * WebSocket is DISABLED in production (Render free tier doesn't support it).
 * Only connects on localhost for development.
 */

import io from 'socket.io-client';

// Runtime check for production - this runs in the browser, not at build time
const isProductionRuntime = () => {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  // Only localhost and 127.0.0.1 are considered development
  return hostname !== 'localhost' && hostname !== '127.0.0.1';
};

class HotelWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    // Check at runtime, not build time
    this.disabled = true; // Start disabled, only enable in connect() if on localhost
  }

  /**
   * Initialize the WebSocket connection (only works on localhost)
   */
  connect() {
    // CRITICAL: Check hostname at runtime, every time connect is called
    if (typeof window === 'undefined') {
      console.log('[WebSocket] No window object - skipping');
      return;
    }

    const hostname = window.location.hostname;

    // Only allow WebSocket on localhost or 127.0.0.1
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Silent in production - no error spam
      this.disabled = true;
      return;
    }

    this.disabled = false;

    if (this.socket && this.connected) {
      console.log('[WebSocket] Already connected');
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
        console.log('[WebSocket] Connection failed - running in offline mode');
        this.disconnect();
      }
    });

    // Hotel event listeners
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
    if (!hotelId) return () => {};

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

// Auto-connect ONLY on localhost - checked at runtime
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    hotelWebSocketService.connect();
  }
}

export default hotelWebSocketService;
