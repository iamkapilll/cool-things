import React from 'react';

/**
 * ETAList Component - Real-time Bus ETA Display for Smart Bus Nepal
 * Hackathon Project Component - src/components/ETAList.jsx
 * 
 * Features:
 * - Displays sorted list of buses by ETA (nearest first)
 * - Color-coded occupancy indicators matching map markers
 * - Real-time ETA updates every 5 seconds (stable display, no blinking)
 * - Interactive ticket purchase buttons
 * - Responsive Tailwind CSS cards design
 * - Professional hackathon presentation styling
 * - Empty state handling
 * - Route color coding matching bus routes
 */

const ETAList = ({ busETAs, nearestStop, onPurchaseTicket, selectedDestination }) => {
  
  // ============= HELPER FUNCTIONS =============

  /**
   * Get occupancy status with color coding
   * @param {number} occupancy - Bus occupancy percentage (0-100)
   * @returns {object} Status object with color and text
   */
  const getOccupancyStatus = (occupancy) => {
    if (occupancy <= 30) {
      return {
        status: 'Low',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        dotColor: 'bg-green-500',
        description: 'Plenty of seats available'
      };
    } else if (occupancy <= 70) {
      return {
        status: 'Medium',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        dotColor: 'bg-yellow-500',
        description: 'Some seats available'
      };
    } else {
      return {
        status: 'High',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        dotColor: 'bg-red-500',
        description: 'Limited seats available'
      };
    }
  };

  /**
   * Format ETA display with appropriate units
   * @param {number} eta - ETA in minutes
   * @returns {string} Formatted ETA string
   */
  const formatETA = (eta) => {
    if (eta === 0) return 'Arriving now';
    if (eta === 1) return '1 min';
    if (eta < 60) return `${eta} mins`;
    
    const hours = Math.floor(eta / 60);
    const minutes = eta % 60;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  /**
   * Get route color for styling
   * @param {string} color - Hex color from route config
   * @returns {string} Tailwind-safe color for borders and accents
   */
  const getRouteColorClass = (color) => {
    const colorMap = {
      '#3B82F6': 'border-blue-500',    // Ring Road - Blue
      '#EF4444': 'border-red-500',     // Inside Ring Road - Red  
      '#10B981': 'border-green-500',   // Kathmandu-Lalitpur - Green
      '#F59E0B': 'border-yellow-500'   // Kathmandu-Bhaktapur - Amber
    };
    return colorMap[color] || 'border-gray-400';
  };

  // ============= RENDER COMPONENTS =============

  /**
   * Render individual bus ETA card
   * @param {object} bus - Bus ETA object
   * @param {number} index - Index for staggered animations
   * @returns {JSX.Element} Bus card component
   */
  const renderBusCard = (bus, index) => {
    const occupancyInfo = getOccupancyStatus(bus.occupancy);
    const routeColorClass = getRouteColorClass(bus.color);
    
    return (
      <div
        key={bus.busId}
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${routeColorClass} transform hover:scale-102`}
        style={{
          animationDelay: `${index * 100}ms`,
          animation: 'slideInRight 0.5s ease-out forwards'
        }}
      >
        <div className="p-4">
          {/* Bus Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {/* Bus Icon */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                style={{ backgroundColor: bus.color }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
              </div>
              
              {/* Bus Info */}
              <div>
                <h3 className="font-bold text-lg text-gray-900">{bus.busId}</h3>
                <p className="text-sm text-gray-600 font-medium">{bus.route}</p>
              </div>
            </div>
            
            {/* ETA Display */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatETA(bus.eta)}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {bus.eta > 0 ? 'ETA' : 'NOW'}
              </p>
            </div>
          </div>
          
          {/* Bus Details */}
          <div className="space-y-2 mb-4">
            {/* Next Stop */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Next Stop:
              </span>
              <span className="font-semibold text-gray-800">{bus.nextStop}</span>
            </div>
            
            {/* Occupancy */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Occupancy:
              </span>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${occupancyInfo.color}`}>
                  {bus.occupancy}%
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${occupancyInfo.color} ${occupancyInfo.bgColor}`}>
                  {occupancyInfo.status}
                </span>
              </div>
            </div>
            
            {/* Occupancy Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${occupancyInfo.dotColor}`}
                style={{ width: `${bus.occupancy}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">{occupancyInfo.description}</p>
          </div>
          
          {/* Action Button */}
          <button
            onClick={() => onPurchaseTicket(bus.busId)}
            disabled={!selectedDestination}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              selectedDestination
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-98'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedDestination ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                </svg>
                Purchase Ticket
              </span>
            ) : (
              'Select Destination First'
            )}
          </button>
          
          {/* Quick Stats */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Updated now</span>
            <span className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${occupancyInfo.dotColor}`}></div>
              Live tracking
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============= MAIN RENDER =============

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Live Bus ETAs</h2>
            <p className="text-blue-100 text-sm">
              {nearestStop ? `To ${nearestStop.name}` : 'Select your location'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {busETAs ? busETAs.length : 0}
            </div>
            <p className="text-blue-100 text-xs">buses tracked</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* No Nearest Stop State */}
        {!nearestStop && (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Location Not Found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Please enable location access to see nearby bus ETAs
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Location Access
            </button>
          </div>
        )}
        
        {/* No Buses State */}
        {nearestStop && (!busETAs || busETAs.length === 0) && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Buses...</h3>
            <p className="text-gray-500 text-sm">
              Fetching real-time bus information for {nearestStop.name}
            </p>
          </div>
        )}
        
        {/* Bus List */}
        {nearestStop && busETAs && busETAs.length > 0 && (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">How to use:</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Select your destination, then click "Purchase Ticket" on your preferred bus. 
                    Buses are sorted by arrival time - nearest first!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Sort Info */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd"/>
                </svg>
                Sorted by arrival time
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                Updates every 5 seconds
              </span>
            </div>
            
            {/* Bus Cards */}
            {busETAs.map((bus, index) => renderBusCard(bus, index))}
            
            {/* Footer Info */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .active\:scale-98:active {
          transform: scale(0.98);
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default ETAList;