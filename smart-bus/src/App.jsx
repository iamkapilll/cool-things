import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import ETAList from "./components/ETAList";
import QRTicket from "./components/QRTicket";
import stops from "./stops.json";
import { fares } from "./fares";

export default function App() {
  const [busPositions, setBusPositions] = useState([
    { id: "A", lat: stops[0].lat, lng: stops[0].lng, index: 0, nextIndex: 1, progress: 0, stopTimer: 0 },
    { id: "B", lat: stops[1].lat, lng: stops[1].lng, index: 1, nextIndex: 2, progress: 0, stopTimer: 0 }
  ]);

  const [busETAs, setBusETAs] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(stops[0].name);
  const [ticket, setTicket] = useState(null);

  // -----------------------
  // Animate buses with smooth movement and stop pause
  // -----------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPositions(prev =>
        prev.map(bus => {
          let { index, nextIndex, progress, stopTimer } = bus;
          const from = stops[index];
          const to = stops[nextIndex];

          // Stop at stop for max 20 ticks (simulate ≤2 min)
          if (stopTimer < 20) {
            return { ...bus, stopTimer: stopTimer + 1 };
          }

          let newProgress = progress + 0.01; // slower animation
          let newIndex = index;
          let newNextIndex = nextIndex;

          if (newProgress >= 1) {
            newIndex = nextIndex;
            newNextIndex = (nextIndex + 1) % stops.length;
            newProgress = 0;
            stopTimer = 0;
          }

          const newLat = from.lat + (to.lat - from.lat) * newProgress;
          const newLng = from.lng + (to.lng - from.lng) * newProgress;

          return { ...bus, lat: newLat, lng: newLng, index: newIndex, nextIndex: newNextIndex, progress: newProgress, stopTimer };
        })
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // -----------------------
  // Get user location
  // -----------------------
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.error(err)
    );
  }, []);

  // -----------------------
  // Find nearest stop
  // -----------------------
  const findNearestStop = () => {
    if (!userLocation) return stops[0].name;
    let nearest = stops[0];
    let minDist = Infinity;
    stops.forEach(stop => {
      const dist = Math.sqrt(Math.pow(stop.lat - userLocation.lat, 2) + Math.pow(stop.lng - userLocation.lng, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = stop;
      }
    });
    return nearest.name;
  };

  // -----------------------
  // ETA Calculation
  // -----------------------
  const calculateETA = (bus, userStop) => {
    const stopsCount = stops.length;
    let distance = 0;
    let index = bus.index;
    let nextIndex = bus.nextIndex;
    let progress = bus.progress;
    let stopPauseTicks = 0;

    while (stops[nextIndex].name !== userStop.name) {
      const from = stops[index];
      const to = stops[nextIndex];
      distance += Math.sqrt(Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2));
      stopPauseTicks += 20;
      index = nextIndex;
      nextIndex = (nextIndex + 1) % stopsCount;
    }

    // Add remaining distance of current segment
    const from = stops[bus.index];
    const to = stops[bus.nextIndex];
    distance += Math.sqrt(Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2)) * (1 - progress);

    const eta = Math.ceil(distance * 100 + stopPauseTicks * 0.1);
    return Math.round(eta); // stable ETA
  };

  // -----------------------
  // Update ETAs every 5 seconds
  // -----------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const nearestStop = findNearestStop();
      const newETAs = {};
      busPositions.forEach(bus => {
        newETAs[bus.id] = calculateETA(bus, stops.find(s => s.name === nearestStop));
      });

      setBusETAs(prev => {
        const updated = { ...prev };
        Object.keys(newETAs).forEach(id => {
          if (Math.abs(newETAs[id] - (prev[id] || 0)) >= 1) {
            updated[id] = newETAs[id];
          }
        });
        return updated;
      });

      // Update ticket ETA
      if (ticket) {
        const fromStop = ticket.from;
        setTicket(prev => ({
          ...prev,
          eta: busPositions.map(bus => calculateETA(bus, stops.find(s => s.name === fromStop)))
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [busPositions, userLocation, ticket]);

  // -----------------------
  // Buy Ticket
  // -----------------------
  const buyTicket = () => {
    const fromStop = findNearestStop();
    const fare = fares[fromStop][destination];
    setTicket({
      id: Date.now(),
      from: fromStop,
      to: destination,
      fare,
      eta: busPositions.map(bus => calculateETA(bus, stops.find(s => s.name === fromStop)))
    });
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="md:w-2/3 p-2">
        <MapView busPositions={busPositions} stops={stops} userLocation={userLocation} />
      </div>

      <div className="md:w-1/3 p-4 space-y-4 overflow-y-auto">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-2">Bus ETAs at Your Stop</h2>
          <p className="mb-2 text-gray-600">
            Your nearest stop: <strong>{findNearestStop()}</strong>
          </p>
          <ETAList busETAs={busETAs} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg space-y-2">
          <label className="block font-semibold mb-1">Select Destination:</label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            className="w-full p-2 rounded border"
          >
            {stops.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
          </select>
          <button
            onClick={buyTicket}
            className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Buy Ticket
          </button>
        </div>

        {ticket && <QRTicket ticket={ticket} />}
      </div>
    </div>
  );
}
