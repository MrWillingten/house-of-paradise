import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Maximize2, Minimize2, Layers, Navigation, Zap, Hand, MousePointer } from 'lucide-react';

const MapView = ({ hotels, onHotelClick, selectedHotel, onMapBoundsChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard');
  const [userLocation, setUserLocation] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const overlayTimeoutRef = useRef(null);
  const boundsUpdateTimerRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Leaflet dynamically
  useEffect(() => {
    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = initializeMap;
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Update markers when hotels change
  useEffect(() => {
    if (mapInstanceRef.current && hotels.length > 0) {
      updateMarkers();
    }
  }, [hotels, selectedHotel]);

  const showOverlayMessage = (message) => {
    setOverlayMessage(message);
    setShowOverlay(true);

    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }

    overlayTimeoutRef.current = setTimeout(() => {
      setShowOverlay(false);
    }, 2000);
  };

  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    // Check if map already initialized
    if (mapInstanceRef.current) {
      console.log('Map already initialized, skipping...');
      return;
    }

    // Default center (can be user's location or first hotel)
    const defaultCenter = hotels.length > 0 && hotels[0].coordinates
      ? [hotels[0].coordinates.lat, hotels[0].coordinates.lng]
      : [40.7128, -74.0060]; // Default to NYC

    try {
      // Initialize map with scroll wheel zoom disabled by default
      const map = window.L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
        scrollWheelZoom: false, // Disabled - require Ctrl on desktop
        dragging: !isMobile, // Enable dragging on desktop, disable on mobile initially
        touchZoom: false, // Disabled - require two fingers on mobile
      });

      // Add tile layer (OpenStreetMap - free!)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add zoom control to bottom right
      window.L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Handle desktop scroll wheel (require Ctrl)
      const mapContainer = mapRef.current;

      mapContainer.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
          // Allow zoom with Ctrl
          e.preventDefault();
          const delta = e.deltaY > 0 ? -1 : 1;
          map.setZoom(map.getZoom() + delta * 0.5);
        } else {
          // Show overlay message
          showOverlayMessage('Use Ctrl + scroll to zoom the map');
        }
      }, { passive: false });

      // Handle mobile touch events
      let touchCount = 0;
      let lastTouchTime = 0;

      mapContainer.addEventListener('touchstart', (e) => {
        touchCount = e.touches.length;
        lastTouchTime = Date.now();

        if (touchCount === 2) {
          // Two fingers - enable zoom and pan
          map.touchZoom.enable();
          map.dragging.enable();
        } else if (touchCount === 1) {
          // One finger - show message after a short delay if still one finger
          setTimeout(() => {
            if (touchCount === 1 && Date.now() - lastTouchTime < 300) {
              showOverlayMessage('Use two fingers to move the map');
            }
          }, 150);
        }
      }, { passive: true });

      mapContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && !isFullscreen) {
          // Single finger - prevent map interaction, allow page scroll
          map.dragging.disable();
          map.touchZoom.disable();
        } else if (e.touches.length >= 2) {
          // Two or more fingers - allow map interaction
          map.touchZoom.enable();
          map.dragging.enable();
        }
      }, { passive: true });

      mapContainer.addEventListener('touchend', (e) => {
        touchCount = e.touches.length;
        if (touchCount === 0) {
          // Reset - disable map interaction
          if (!isFullscreen) {
            map.dragging.disable();
            map.touchZoom.disable();
          }
        }
      }, { passive: true });

      // Add markers
      updateMarkers();

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userPos = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);

          // Add user location marker
          const userIcon = window.L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
            "></div>`,
            iconSize: [20, 20],
          });

          window.L.marker(userPos, { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>You are here!</b>');
        });
      }

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    const bounds = [];

    hotels.forEach((hotel) => {
      // Skip hotels without coordinates
      if (!hotel.coordinates || !hotel.coordinates.lat || !hotel.coordinates.lng) {
        return;
      }

      const position = [hotel.coordinates.lat, hotel.coordinates.lng];
      bounds.push(position);

      // Determine marker color based on availability
      let markerColor = '#10b981'; // Green (available)
      if (hotel.availabilityStatus === 'limited') markerColor = '#f59e0b'; // Orange
      if (hotel.availabilityStatus === 'almost_full') markerColor = '#ef4444'; // Red

      // Create custom icon with hotel image and name
      const isSelected = selectedHotel && selectedHotel._id === hotel._id;
      const hotelImage = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop';

      const markerIcon = window.L.divIcon({
        className: 'custom-hotel-marker',
        html: `
          <div style="
            position: relative;
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <!-- Hotel Name Label -->
            <div style="
              background: rgba(0, 0, 0, 0.85);
              color: white;
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              margin-bottom: 6px;
              max-width: 150px;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
              ${hotel.name.length > 20 ? hotel.name.substring(0, 20) + '...' : hotel.name}
            </div>

            <!-- Circular Image Marker -->
            <div style="
              position: relative;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              overflow: hidden;
              border: 3px solid ${markerColor};
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              cursor: pointer;
              background: white;
            ">
              <img
                src="${hotelImage}"
                alt="${hotel.name}"
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                "
                onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop'"
              />

              <!-- Price Badge -->
              <div style="
                position: absolute;
                bottom: -2px;
                left: 50%;
                transform: translateX(-50%);
                background: ${markerColor};
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 800;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                white-space: nowrap;
              ">
                $${hotel.pricePerNight}
              </div>
            </div>

            ${hotel.isPopular ? `
              <div style="
                position: absolute;
                top: 28px;
                right: -6px;
                width: 22px;
                height: 22px;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                box-shadow: 0 2px 6px rgba(245, 158, 11, 0.5);
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [150, 80],
        iconAnchor: [75, 80],
      });

      // Create marker
      const marker = window.L.marker(position, { icon: markerIcon })
        .addTo(map);

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <img
            src="${hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop'}"
            alt="${hotel.name}"
            style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
          />
          <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #1f2937;">${hotel.name}</h3>
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
            ${hotel.city || hotel.location}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              ${hotel.rating > 0 ? `
                <span style="
                  background: #fffbeb;
                  color: #92400e;
                  padding: 4px 8px;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 600;
                "> ${hotel.rating.toFixed(1)}</span>
              ` : ''}
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: 800; color: #10b981;">$${hotel.pricePerNight}</div>
              <div style="font-size: 11px; color: #6b7280;">per night</div>
            </div>
          </div>
          <div style="font-size: 12px; color: #047857; background: #f0fdf4; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px;">
            ${hotel.availableRooms} rooms available
          </div>
          <button
            onclick="window.viewHotelDetails('${hotel._id}')"
            style="
              width: 100%;
              padding: 8px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 13px;
              cursor: pointer;
            "
          >View Details</button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      // Handle marker click
      marker.on('click', () => {
        if (onHotelClick) {
          onHotelClick(hotel);
        }
      });

      // Handle popup open
      marker.on('popupopen', () => {
        if (onHotelClick) {
          onHotelClick(hotel);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Make viewHotelDetails available globally for popup button
  useEffect(() => {
    window.viewHotelDetails = (hotelId) => {
      window.location.href = `/hotel/${hotelId}`;
    };
  }, []);

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);

    // When entering fullscreen, enable dragging
    if (mapInstanceRef.current) {
      if (newFullscreen) {
        mapInstanceRef.current.dragging.enable();
        mapInstanceRef.current.touchZoom.enable();
      } else if (isMobile) {
        mapInstanceRef.current.dragging.disable();
        mapInstanceRef.current.touchZoom.disable();
      }
    }
  };

  const changeMapStyle = (style) => {
    if (!mapInstanceRef.current || !window.L) return;

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof window.L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer based on style
    let tileUrl = '';
    switch (style) {
      case 'standard':
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        break;
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        break;
      case 'dark':
        tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        break;
      case 'light':
        tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        break;
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    window.L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    setMapStyle(style);
  };

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView(userLocation, 14);
    }
  };

  return (
    <div style={{
      ...styles.container,
      ...(isFullscreen && styles.fullscreen),
      height: isMobile ? '350px' : '500px',
    }}>
      {/* Gesture Overlay */}
      <div style={{
        ...styles.overlay,
        opacity: showOverlay ? 1 : 0,
        pointerEvents: showOverlay ? 'none' : 'none',
      }}>
        <div style={styles.overlayContent}>
          {isMobile ? (
            <>
              <Hand size={32} style={{ marginBottom: '0.5rem' }} />
              <span>{overlayMessage}</span>
            </>
          ) : (
            <>
              <MousePointer size={32} style={{ marginBottom: '0.5rem' }} />
              <span>{overlayMessage}</span>
            </>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div style={{
        ...styles.controls,
        flexDirection: isMobile ? 'row' : 'column',
        top: isMobile ? '0.5rem' : '1rem',
        right: isMobile ? '0.5rem' : '1rem',
      }}>
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          style={{
            ...styles.controlButton,
            width: isMobile ? '40px' : '44px',
            height: isMobile ? '40px' : '44px',
          }}
          className="map-control-btn"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={isMobile ? 18 : 20} /> : <Maximize2 size={isMobile ? 18 : 20} />}
        </button>

        {/* Map Style Selector - Hidden on mobile unless fullscreen */}
        {(!isMobile || isFullscreen) && (
          <div style={styles.styleSelector}>
            <button
              onClick={() => changeMapStyle('standard')}
              style={mapStyle === 'standard' ? styles.styleButtonActive : styles.styleButton}
              className="map-style-btn"
            >
              Standard
            </button>
            <button
              onClick={() => changeMapStyle('satellite')}
              style={mapStyle === 'satellite' ? styles.styleButtonActive : styles.styleButton}
              className="map-style-btn"
            >
              Satellite
            </button>
            <button
              onClick={() => changeMapStyle('dark')}
              style={mapStyle === 'dark' ? styles.styleButtonActive : styles.styleButton}
              className="map-style-btn"
            >
              Dark
            </button>
          </div>
        )}

        {/* Center on User */}
        {userLocation && (
          <button
            onClick={centerOnUser}
            style={{
              ...styles.controlButton,
              width: isMobile ? '40px' : '44px',
              height: isMobile ? '40px' : '44px',
            }}
            className="map-control-btn"
            title="My Location"
          >
            <Navigation size={isMobile ? 18 : 20} />
          </button>
        )}
      </div>

      {/* Hotel Count Badge */}
      <div style={{
        ...styles.hotelCount,
        padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
        top: isMobile ? '0.5rem' : '1rem',
        left: isMobile ? '0.5rem' : '1rem',
      }}>
        <MapPin size={isMobile ? 14 : 16} color="#10b981" />
        <span style={{
          ...styles.countText,
          fontSize: isMobile ? '0.8rem' : '0.9rem',
        }}>{hotels.length} hotels</span>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={styles.map}
      />

      {/* Legend - Hidden on mobile unless fullscreen */}
      {(!isMobile || isFullscreen) && (
        <div style={{
          ...styles.legend,
          bottom: isMobile ? '0.5rem' : '1rem',
          left: isMobile ? '0.5rem' : '1rem',
        }}>
          <div style={styles.legendTitle}>Availability</div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#10b981'}}></div>
            <span>Available</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#f59e0b'}}></div>
            <span>Limited</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendDot, background: '#ef4444'}}></div>
            <span>Almost Full</span>
          </div>
        </div>
      )}

      {/* Mobile hint */}
      {isMobile && !isFullscreen && (
        <div style={styles.mobileHint}>
          <Hand size={14} />
          <span>Use two fingers to navigate</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    background: '#f9fafb',
  },
  fullscreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    borderRadius: 0,
    height: '100vh !important',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
    transition: 'opacity 0.3s ease',
  },
  overlayContent: {
    background: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    zIndex: 1000,
    display: 'flex',
    gap: '0.5rem',
  },
  controlButton: {
    background: 'white',
    border: 'none',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1f2937',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'all 0.2s',
  },
  styleSelector: {
    background: 'white',
    borderRadius: '12px',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  styleButton: {
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  styleButtonActive: {
    padding: '0.5rem 0.75rem',
    background: '#f0fdf4',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#047857',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  hotelCount: {
    position: 'absolute',
    zIndex: 1000,
    background: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  countText: {
    fontWeight: '700',
    color: '#1f2937',
  },
  legend: {
    position: 'absolute',
    zIndex: 1000,
    background: 'white',
    padding: '0.75rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  legendTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  mobileHint: {
    position: 'absolute',
    bottom: '0.5rem',
    right: '0.5rem',
    zIndex: 1000,
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.7rem',
    fontWeight: '500',
  },
};

// Add global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .map-control-btn:hover {
      background: #f0fdf4;
      color: #10b981;
      transform: scale(1.1);
    }

    .map-control-btn:active {
      transform: scale(0.95);
    }

    .map-style-btn:hover {
      background: #f9fafb;
    }

    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      padding: 0;
    }

    .custom-popup .leaflet-popup-content {
      margin: 0;
    }

    .custom-popup .leaflet-popup-tip {
      background: white;
    }

    .custom-hotel-marker {
      background: transparent;
      border: none;
    }

    .custom-hotel-marker:hover {
      transform: scale(1.1);
      z-index: 1000 !important;
    }

    .leaflet-container {
      font-family: inherit;
    }

    .user-location-marker {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }

    /* Mobile adjustments for map */
    @media (max-width: 768px) {
      .leaflet-control-zoom {
        margin-bottom: 60px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default MapView;
