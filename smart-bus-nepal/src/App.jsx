import React, { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import ETAList from './components/ETAList';
import QRTicket from './components/QRTicket';

// Import data files (will be created in next steps)
import stopsData from './data/stops.json';
import faresData from './data/fares.json';

/**
 * Smart Bus Nepal - Main App Component
 * Hackathon Project for Real-time Bus Tracking in Kathmandu Valley
 * 
 * Features:
 * - Real-time bus tracking with smooth animation
 * - User location detection and nearest stop calculation  
 * - ETA calculations updated every 5 seconds
 * - Bus occupancy simulation (0-100%)
 * - Fare calculation and ticket generation
 * - QR code ticket system
 * - Interactive map with Leaflet
 */

const App = () => {
  // ============= STATE MANAGEMENT =============
  
  // User location state
  const [userLocation, setUserLocation] = useState(null);
  const [nearestStop, setNearestStop] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // Bus tracking state
  const [buses, setBuses] = useState([]);
  const [busETAs, setBusETAs] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  
  // Ticket system state
  const [ticket, setTicket] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  
  // App loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation reference for smooth bus movement
  const animationRef = useRef();
  const lastUpdateTime = useRef(Date.now());

  // ============= CONSTANTS =============
  
  // Bus routes configuration - Multiple routes covering Kathmandu Valley
  const BUS_ROUTES = {
    'Ring Road': {
      id: 'ring_road',
      color: '#3B82F6', // Blue
      stops: ['Kalanki', 'Kalimati', 'Tripureshwor', 'New Baneshwor', 'Koteshwor', 'Jadibuti', 'Gwarko', 'Satdobato', 'Lagankhel']
    },
    'Inside Ring Road': {
      id: 'inside_ring',
      color: '#EF4444', // Red
      stops: ['Ratna Park', 'Asan', 'Indra Chowk', 'Basantapur', 'Bhotahity', 'Singha Durbar', 'Babar Mahal']
    },
    'Kathmandu-Lalitpur': {
      id: 'ktm_lalitpur',
      color: '#10B981', // Green
      stops: ['Ratna Park', 'Tripureshwor', 'Kupondole', 'Pulchowk', 'Mangal Bazaar', 'Patan Dhoka']
    },
    'Kathmandu-Bhaktapur': {
      id: 'ktm_bhaktapur',
      color: '#F59E0B', // Amber
      stops: ['Ratna Park', 'New Baneshwor', 'Jadibuti', 'Bhaktapur Bus Park', 'Durbar Square']
    }
  };

  // Bus speed configuration (km/h)
  const BUS_SPEED = 25; // Average city bus speed
  const STOP_PAUSE_TIME = 120; // 2 minutes pause at each stop

  // ============= HELPER FUNCTIONS =============

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point  
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  /**
   * Find nearest bus stop to user location
   * @param {object} userPos - User's current position {lat, lng}
   * @returns {object} Nearest stop object
   */
  const findNearestStop = (userPos) => {
    if (!userPos || !stopsData) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    stopsData.forEach(stop => {
      const distance = calculateDistance(userPos.lat, userPos.lng, stop.lat, stop.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...stop, distance: minDistance };
      }
    });
    
    return nearest;
  };

  /**
   * Initialize buses on different routes with random positions
   * Each route gets 2-3 buses for better coverage
   */
  const initializeBuses = () => {
    const initialBuses = [];
    let busIdCounter = 1;
    
    Object.entries(BUS_ROUTES).forEach(([routeName, route]) => {
      const busCount = Math.floor(Math.random() * 2) + 2; // 2-3 buses per route
      
      for (let i = 0; i < busCount; i++) {
        const randomStopIndex = Math.floor(Math.random() * route.stops.length);
        const currentStop = stopsData.find(stop => stop.name === route.stops[randomStopIndex]);
        const nextStopIndex = (randomStopIndex + 1) % route.stops.length;
        const nextStop = stopsData.find(stop => stop.name === route.stops[nextStopIndex]);
        
        if (currentStop && nextStop) {
          initialBuses.push({
            id: `Bus-${String(busIdCounter).padStart(3, '0')}`,
            route: routeName,
            routeId: route.id,
            color: route.color,
            currentStopIndex: randomStopIndex,
            position: { lat: currentStop.lat, lng: currentStop.lng },
            nextStop: nextStop,
            occupancy: Math.floor(Math.random() * 101), // 0-100% occupancy
            speed: BUS_SPEED + (Math.random() * 10 - 5), // Slight speed variation
            isAtStop: Math.random() < 0.3, // 30% chance bus is currently at stop
            stopArrivalTime: Date.now() - Math.random() * STOP_PAUSE_TIME * 1000,
            stops: route.stops
          });
          busIdCounter++;
        }
      }
    });
    
    return initialBuses;
  };

  /**
   * Calculate ETA for a bus to reach a specific stop
   * @param {object} bus - Bus object
   * @param {string} targetStopName - Name of target stop
   * @returns {number} ETA in minutes
   */
  const calculateBusETA = (bus, targetStopName) => {
    if (!bus || !targetStopName) return 0;
    
    const targetStopIndex = bus.stops.indexOf(targetStopName);
    if (targetStopIndex === -1) return 0;
    
    let totalTime = 0;
    let currentIndex = bus.currentStopIndex;
    
    // If bus is at a stop, add remaining pause time
    if (bus.isAtStop) {
      const timeAtStop = (Date.now() - bus.stopArrivalTime) / 1000;
      const remainingPauseTime = Math.max(0, STOP_PAUSE_TIME - timeAtStop);
      totalTime += remainingPauseTime;
    } else {
      // Add time to reach next stop
      const currentStop = stopsData.find(stop => stop.name === bus.stops[currentIndex]);
      if (currentStop) {
        const distance = calculateDistance(
          bus.position.lat, bus.position.lng,
          bus.nextStop.lat, bus.nextStop.lng
        );
        totalTime += (distance / bus.speed) * 3600; // Convert to seconds
      }
      currentIndex = (currentIndex + 1) % bus.stops.length;
    }
    
    // Add time for intermediate stops
    while (currentIndex !== targetStopIndex) {
      const currentStop = stopsData.find(stop => stop.name === bus.stops[currentIndex]);
      const nextStopIndex = (currentIndex + 1) % bus.stops.length;
      const nextStop = stopsData.find(stop => stop.name === bus.stops[nextStopIndex]);
      
      if (currentStop && nextStop) {
        // Add pause time at intermediate stop
        totalTime += STOP_PAUSE_TIME;
        
        // Add travel time to next stop
        const distance = calculateDistance(
          currentStop.lat, currentStop.lng,
          nextStop.lat, nextStop.lng
        );
        totalTime += (distance / bus.speed) * 3600;
      }
      
      currentIndex = nextStopIndex;
    }
    
    return Math.round(totalTime / 60); // Convert to minutes
  };

  /**
   * Update bus positions with smooth linear interpolation
   * Called every animation frame for smooth movement
   */
  const updateBusPositions = () => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime.current) / 1000; // Convert to seconds
    lastUpdateTime.current = currentTime;
    
    setBuses(prevBuses => 
      prevBuses.map(bus => {
        let updatedBus = { ...bus };
        
        // If bus is at stop, check if pause time is over
        if (updatedBus.isAtStop) {
          const timeAtStop = (currentTime - updatedBus.stopArrivalTime) / 1000;
          if (timeAtStop >= STOP_PAUSE_TIME) {
            // Move to next stop
            updatedBus.isAtStop = false;
            updatedBus.currentStopIndex = (updatedBus.currentStopIndex + 1) % updatedBus.stops.length;
            const nextStopIndex = (updatedBus.currentStopIndex + 1) % updatedBus.stops.length;
            updatedBus.nextStop = stopsData.find(stop => stop.name === updatedBus.stops[nextStopIndex]);
          }
        } else {
          // Bus is moving - interpolate position
          const currentStop = stopsData.find(stop => stop.name === updatedBus.stops[updatedBus.currentStopIndex]);
          const targetStop = updatedBus.nextStop;
          
          if (currentStop && targetStop) {
            const distance = calculateDistance(
              updatedBus.position.lat, updatedBus.position.lng,
              targetStop.lat, targetStop.lng
            );
            
            // Check if arrived at next stop
            if (distance < 0.1) { // 100 meters threshold
              updatedBus.position = { lat: targetStop.lat, lng: targetStop.lng };
              updatedBus.isAtStop = true;
              updatedBus.stopArrivalTime = currentTime;
              // Simulate occupancy change at stops
              updatedBus.occupancy = Math.max(10, Math.min(100, updatedBus.occupancy + (Math.random() * 20 - 10)));
            } else {
              // Linear interpolation for smooth movement
              const speed = updatedBus.speed / 3600; // Convert km/h to km/s
              const moveDistance = speed * deltaTime; // Distance to move this frame
              const totalDistance = calculateDistance(currentStop.lat, currentStop.lng, targetStop.lat, targetStop.lng);
              const ratio = moveDistance / totalDistance;
              
              updatedBus.position = {
                lat: updatedBus.position.lat + (targetStop.lat - updatedBus.position.lat) * ratio,
                lng: updatedBus.position.lng + (targetStop.lng - updatedBus.position.lng) * ratio
              };
            }
          }
        }
        
        return updatedBus;
      })
    );
  };

  /**
   * Update ETAs for all buses to nearest stop
   * Called every 5 seconds for stable ETA display
   */
  const updateETAs = () => {
    if (!nearestStop || buses.length === 0) return;
    
    const etas = buses.map(bus => ({
      busId: bus.id,
      route: bus.route,
      eta: calculateBusETA(bus, nearestStop.name),
      occupancy: Math.round(bus.occupancy),
      color: bus.color,
      nextStop: bus.nextStop?.name || bus.stops[0]
    })).sort((a, b) => a.eta - b.eta); // Sort by ETA
    
    setBusETAs(etas);
  };

  /**
   * Calculate fare between two stops
   * @param {string} fromStop - Origin stop name
   * @param {string} toStop - Destination stop name  
   * @returns {number} Fare amount
   */
  const calculateFare = (fromStop, toStop) => {
    if (!fromStop || !toStop || !faresData) return 0;
    return faresData[fromStop]?.[toStop] || faresData[toStop]?.[fromStop] || 0;
  };

  /**
   * Handle ticket purchase
   * @param {string} busId - Selected bus ID
   */
  const purchaseTicket = (busId) => {
    if (!nearestStop || !selectedDestination) {
      alert('Please select a destination first!');
      return;
    }
    
    const selectedBus = buses.find(bus => bus.id === busId);
    const fare = calculateFare(nearestStop.name, selectedDestination);
    const eta = calculateBusETA(selectedBus, nearestStop.name);
    
    const newTicket = {
      id: `TICKET-${Date.now()}`,
      from: nearestStop.name,
      to: selectedDestination,
      fare: fare,
      busId: busId,
      route: selectedBus.route,
      eta: eta,
      occupancy: Math.round(selectedBus.occupancy),
      purchaseTime: new Date().toISOString(),
      qrData: JSON.stringify({
        ticketId: `TICKET-${Date.now()}`,
        from: nearestStop.name,
        to: selectedDestination,
        busId: busId,
        fare: fare,
        timestamp: Date.now()
      })
    };
    
    setTicket(newTicket);
    setShowTicket(true);
  };

  // ============= EFFECTS =============

  /**
   * Initialize app on component mount
   */
  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // Find nearest stop
          const nearest = findNearestStop(userPos);
          setNearestStop(nearest);
          
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to get your location. Using default location.');
          
          // Use default location (Kathmandu center)
          const defaultPos = { lat: 27.7172, lng: 85.3240 };
          setUserLocation(defaultPos);
          setNearestStop(findNearestStop(defaultPos));
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Geolocation not supported by browser.');
      const defaultPos = { lat: 27.7172, lng: 85.3240 };
      setUserLocation(defaultPos);
      setNearestStop(findNearestStop(defaultPos));
      setIsLoading(false);
    }
    
    // Initialize buses
    setBuses(initializeBuses());
  }, []);

  /**
   * Animation loop for smooth bus movement
   */
  useEffect(() => {
    const animate = () => {
      updateBusPositions();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (buses.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [buses.length]);

  /**
   * ETA update interval - every 5 seconds for stable display
   */
  useEffect(() => {
    const interval = setInterval(updateETAs, 5000);
    updateETAs(); // Initial update
    
    return () => clearInterval(interval);
  }, [buses, nearestStop]);

  // ============= RENDER =============

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Smart Bus Nepal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Bus Nepal</h1>
                <p className="text-sm text-gray-600">Real-time Bus Tracking - Kathmandu Valley</p>
              </div>
            </div>
            
            {nearestStop && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Nearest Stop</p>
                <p className="font-semibold text-blue-600">{nearestStop.name}</p>
                <p className="text-xs text-gray-500">{nearestStop.distance?.toFixed(1)} km away</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Location Error Alert */}
      {locationError && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="text-sm">{locationError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                <MapView 
                  buses={buses}
                  userLocation={userLocation}
                  nearestStop={nearestStop}
                  stops={stopsData}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Destination Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Select Destination</h3>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
              >
                <option value="">Choose destination...</option>
                {stopsData?.map(stop => (
                  <option key={stop.id} value={stop.name}>{stop.name}</option>
                ))}
              </select>
              {selectedDestination && nearestStop && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Fare: Rs. {calculateFare(nearestStop.name, selectedDestination)}
                  </p>
                </div>
              )}
            </div>

            {/* ETA List */}
            <ETAList 
              busETAs={busETAs}
              nearestStop={nearestStop}
              onPurchaseTicket={purchaseTicket}
              selectedDestination={selectedDestination}
            />

            {/* QR Ticket */}
            {showTicket && ticket && (
              <QRTicket 
                ticket={ticket}
                onClose={() => setShowTicket(false)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>&copy; 2025 Smart Bus Nepal - Hackathon Project</p>
        </div>
      </footer>
    </div>
  );
};

export default App;