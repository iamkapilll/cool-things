import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * MapView Component - Interactive Leaflet Map for Smart Bus Nepal`
 * Hackathon Project Component
 * 
 * Features:
 * - Interactive Leaflet map centered on Kathmandu Valley
 * - Real-time bus position markers with color coding by occupancy
 * - Bus stop markers with custom icons
 * - User location marker with accuracy circle
 * - Popups showing bus info (ID, ETA, occupancy, next stop)
 * - Responsive design with Tailwind CSS integration
 * - Smooth marker updates without flickering
 */

const MapView = ({ buses, userLocation, nearestStop, stops }) => {
  // Map and marker references for cleanup and updates
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    buses: new Map(),
    stops: new Map(),
    user: null,
    nearest: null
  });

  // ============= ICON CONFIGURATIONS =============

  /**
   * Create custom bus icon based on occupancy percentage
   * Color coding: Green (0-30%), Yellow (31-70%), Red (71-100%)
   * @param {number} occupancy - Bus occupancy percentage (0-100)
   * @returns {L.DivIcon} Leaflet div icon
   */
  const createBusIcon = (occupancy) => {
    let color, bgColor, textColor;
    
    if (occupancy <= 30) {
      color = '#10B981'; // Green - Low occupancy
      bgColor = 'bg-green-500';
      textColor = 'text-white';
    } else if (occupancy <= 70) {
      color = '#F59E0B'; // Yellow - Medium occupancy
      bgColor = 'bg-yellow-500';
      textColor = 'text-white';
    } else {
      color = '#EF4444'; // Red - High occupancy
      bgColor = 'bg-red-500';
      textColor = 'text-white';
    }

    return L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div class="relative">
          <div class="${bgColor} ${textColor} rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg transform transition-transform hover:scale-110">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 -right-1 ${bgColor} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white font-bold">
            ${Math.round(occupancy)}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  /**
   * Create custom bus stop icon
   * @param {boolean} isNearest - Whether this is the nearest stop to user
   * @returns {L.DivIcon} Leaflet div icon
   */
  const createStopIcon = (isNearest = false) => {
    const bgColor = isNearest ? 'bg-blue-600' : 'bg-gray-600';
    const pulseClass = isNearest ? 'animate-pulse' : '';
    
    return L.divIcon({
      className: 'custom-stop-marker',
      html: `
        <div class="${bgColor} ${pulseClass} rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  /**
   * Create user location icon
   * @returns {L.DivIcon} Leaflet div icon
   */
  const createUserIcon = () => {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative">
          <div class="bg-blue-500 rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse"></div>
          <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    });
  };

  // ============= POPUP CONTENT GENERATORS =============

  /**
   * Generate popup content for bus markers
   * @param {object} bus - Bus object with all properties
   * @returns {string} HTML string for popup content
   */
  const createBusPopupContent = (bus) => {
    const occupancyColor = bus.occupancy <= 30 ? 'text-green-600' : 
                          bus.occupancy <= 70 ? 'text-yellow-600' : 'text-red-600';
    
    return `
      <div class="p-2 min-w-48">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-lg text-gray-800">${bus.id}</h3>
          <span class="px-2 py-1 rounded-full text-xs font-semibold" style="background-color: ${bus.color}20; color: ${bus.color}">
            ${bus.route}
          </span>
        </div>
        
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Occupancy:</span>
            <span class="${occupancyColor} font-semibold">${Math.round(bus.occupancy)}%</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Next Stop:</span>
            <span class="font-medium text-gray-800">${bus.nextStop?.name || 'Unknown'}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Status:</span>
            <span class="font-medium ${bus.isAtStop ? 'text-red-600' : 'text-green-600'}">
              ${bus.isAtStop ? 'At Stop' : 'In Transit'}
            </span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Speed:</span>
            <span class="font-medium text-gray-800">${Math.round(bus.speed)} km/h</span>
          </div>
        </div>
        
        <div class="mt-3 pt-2 border-t border-gray-200">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-300 ${
              bus.occupancy <= 30 ? 'bg-green-500' : 
              bus.occupancy <= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }" style="width: ${bus.occupancy}%"></div>
          </div>
          <p class="text-xs text-gray-500 mt-1 text-center">Bus Occupancy</p>
        </div>
      </div>
    `;
  };

  /**
   * Generate popup content for stop markers
   * @param {object} stop - Stop object with properties
   * @param {boolean} isNearest - Whether this is the nearest stop
   * @returns {string} HTML string for popup content
   */
  const createStopPopupContent = (stop, isNearest) => {
    return `
      <div class="p-2">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-lg text-gray-800">${stop.name}</h3>
          ${isNearest ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">Nearest</span>' : ''}
        </div>
        
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Zone:</span>
            <span class="font-medium text-gray-800">${stop.zone || 'Central'}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Type:</span>
            <span class="font-medium text-gray-800">${stop.type || 'Regular'}</span>
          </div>
          
          ${isNearest && stop.distance ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Distance:</span>
              <span class="font-medium text-blue-600">${stop.distance.toFixed(2)} km</span>
            </div>
          ` : ''}
        </div>
        
        <div class="mt-2 pt-2 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            ${isNearest ? 'Your nearest bus stop' : 'Bus stop in Kathmandu Valley'}
          </p>
        </div>
      </div>
    `;
  };

  // ============= MAP INITIALIZATION =============

  /**
   * Initialize Leaflet map with proper configuration
   */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Kathmandu Valley
    const map = L.map(mapRef.current, {
      center: [27.7172, 85.3240], // Kathmandu coordinates
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true // Better performance for many markers
    });

    // Add tile layer - Using OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Add custom attribution
    L.control.attribution({
      prefix: '<a href="https://leafletjs.com/">Leaflet</a>'
    }).addTo(map);

    // Add custom zoom control positioning
    map.zoomControl.setPosition('topright');

    // Store map instance
    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ============= USER LOCATION UPDATES =============

  /**
   * Update user location marker
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // Remove existing user marker
    if (markers.user) {
      map.removeLayer(markers.user);
    }

    // Add user location marker
    markers.user = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserIcon(),
      zIndexOffset: 1000
    }).addTo(map);

    // Add popup to user marker
    markers.user.bindPopup(`
      <div class="p-2">
        <h3 class="font-bold text-lg text-blue-600 mb-2">Your Location</h3>
        <p class="text-sm text-gray-600">
          Lat: ${userLocation.lat.toFixed(6)}<br>
          Lng: ${userLocation.lng.toFixed(6)}
        </p>
        <p class="text-xs text-gray-500 mt-2">
          Location accuracy: GPS enabled
        </p>
      </div>
    `);

    // Pan to user location on first load
    map.setView([userLocation.lat, userLocation.lng], 13);

  }, [userLocation]);

  // ============= BUS STOPS UPDATES =============

  /**
   * Update bus stop markers
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !stops) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // Clear existing stop markers
    markers.stops.forEach(marker => map.removeLayer(marker));
    markers.stops.clear();

    // Clear existing nearest stop marker
    if (markers.nearest) {
      map.removeLayer(markers.nearest);
      markers.nearest = null;
    }

    // Add bus stop markers
    stops.forEach(stop => {
      const isNearest = nearestStop && stop.id === nearestStop.id;
      
      const marker = L.marker([stop.lat, stop.lng], {
        icon: createStopIcon(isNearest),
        zIndexOffset: isNearest ? 500 : 100
      }).addTo(map);

      marker.bindPopup(createStopPopupContent(stop, isNearest));

      if (isNearest) {
        markers.nearest = marker;
      } else {
        markers.stops.set(stop.id, marker);
      }
    });

  }, [stops, nearestStop]);

  // ============= BUS POSITION UPDATES =============

  /**
   * Update bus markers with smooth position transitions
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !buses || buses.length === 0) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // Get current bus IDs
    const currentBusIds = new Set(buses.map(bus => bus.id));

    // Remove markers for buses that no longer exist
    markers.buses.forEach((marker, busId) => {
      if (!currentBusIds.has(busId)) {
        map.removeLayer(marker);
        markers.buses.delete(busId);
      }
    });

    // Update or create markers for each bus
    buses.forEach(bus => {
      const existingMarker = markers.buses.get(bus.id);
      
      if (existingMarker) {
        // Update existing marker position smoothly
        const currentLatLng = existingMarker.getLatLng();
        const newLatLng = L.latLng(bus.position.lat, bus.position.lng);
        
        // Only update if position changed significantly (avoid jitter)
        if (currentLatLng.distanceTo(newLatLng) > 10) { // 10 meters threshold
          existingMarker.setLatLng(newLatLng);
          
          // Update icon if occupancy changed significantly
          const currentOccupancy = existingMarker._occupancy || 0;
          if (Math.abs(bus.occupancy - currentOccupancy) > 5) {
            existingMarker.setIcon(createBusIcon(bus.occupancy));
            existingMarker._occupancy = bus.occupancy;
          }
          
          // Update popup content
          existingMarker.setPopupContent(createBusPopupContent(bus));
        }
      } else {
        // Create new marker
        const marker = L.marker([bus.position.lat, bus.position.lng], {
          icon: createBusIcon(bus.occupancy),
          zIndexOffset: 200
        }).addTo(map);

        marker.bindPopup(createBusPopupContent(bus));
        marker._occupancy = bus.occupancy;
        
        markers.buses.set(bus.id, marker);
      }
    });

  }, [buses]);

  // ============= MAP BOUNDS ADJUSTMENT =============

  /**
   * Adjust map bounds to show all important markers
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !buses || buses.length === 0) return;

    const map = mapInstanceRef.current;
    const bounds = L.latLngBounds();

    // Add user location to bounds
    bounds.extend([userLocation.lat, userLocation.lng]);

    // Add bus positions to bounds
    buses.forEach(bus => {
      bounds.extend([bus.position.lat, bus.position.lng]);
    });

    // Add nearest stop to bounds
    if (nearestStop) {
      bounds.extend([nearestStop.lat, nearestStop.lng]);
    }

    // Fit map to bounds with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 15
      });
    }

  }, [userLocation, nearestStop]); // Only adjust bounds when user location or nearest stop changes

  // ============= RENDER =============

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
          
          {/* Bus Occupancy Legend */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Low (0-30%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Medium (31-70%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">High (71-100%)</span>
          </div>
          
          <hr className="my-2 border-gray-200" />
          
          {/* Other Markers Legend */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-xs text-gray-600">Nearest Stop</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-600">Bus Stop</span>
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {(!buses || buses.length === 0) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading buses...</p>
          </div>
        </div>
      )}
      
      {/* Bus Count Info */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {buses ? buses.length : 0} buses active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;