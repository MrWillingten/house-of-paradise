/**
 * CENTRALIZED HOTEL WEBSOCKET SERVICE
 *
 * Manages a single WebSocket connection for all hotel real-time updates.
 * Prevents multiple connections and improves performance.
 */

import io from 'socket.io-client';

// WebSocket URL - use hotel service directly for WebSocket connections
// In production (Render free tier), WebSockets are not reliably supported
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3001';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.REACT_APP_API_URL;

class HotelWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map(); // Store listeners by hotelId
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.disabled = IS_PRODUCTION; // Disable WebSocket in production (free tier doesn't support it well)
  }

  /**
   * Initialize the WebSocket connection (call once on app start)
   */
  connect() {
    // Skip WebSocket connection in production (Render free tier limitation)
    if (this.disabled) {
      console.log('ℹ️ WebSocket disabled in production mode');
      return;
    }

    if (this.socket && this.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to Hotel WebSocket...');

    this.socket = io(WEBSOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
      transports: ['websocket', 'polling'] // Try websocket first, fallback to polling
    });

    this.socket.on('connect', () => {
      console.log('✅ Hotel WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Hotel WebSocket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('⚠️  Hotel WebSocket: Max reconnection attempts reached. Running in offline mode.');
      }
    });

    // Listen for hotel-specific updates
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

  /**
   * Subscribe to updates for a specific hotel
   * @param {string} hotelId - The hotel ID to subscribe to
   * @param {function} callback - Callback function to receive updates
   * @returns {function} Unsubscribe function
   */
  subscribe(hotelId, callback) {
    if (!hotelId) return () => {};

    // Store listener
    if (!this.listeners.has(hotelId)) {
      this.listeners.set(hotelId, []);
    }
    this.listeners.get(hotelId).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(hotelId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        // Clean up if no more listeners
        if (callbacks.length === 0) {
          this.listeners.delete(hotelId);
        }
      }
    };
  }

  /**
   * Notify all listeners for a specific hotel
   */
  notifyListeners(hotelId, eventType, data) {
    const callbacks = this.listeners.get(hotelId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(eventType, data);
        } catch (error) {
          console.error('Error in WebSocket callback:', error);
        }
      });
    }
  }

  /**
   * Disconnect the WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting Hotel WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const hotelWebSocketService = new HotelWebSocketService();

// Auto-connect on import (optional - can be called manually if preferred)
if (typeof window !== 'undefined') {
  hotelWebSocketService.connect();
}

export default hotelWebSocketService;
