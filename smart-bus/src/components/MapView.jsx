import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapView({ busPositions, stops, userLocation }) {
  const center = userLocation || { lat: 27.7172, lng: 85.3240 }; // Kathmandu

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
      />

      {stops.map((stop, i) => (
        <Marker key={i} position={{ lat: stop.lat, lng: stop.lng }}>
          <Popup>{stop.name}</Popup>
        </Marker>
      ))}

      {busPositions.map(bus => (
        <Marker key={bus.id} position={{ lat: bus.lat, lng: bus.lng }}>
          <Popup>Bus {bus.id}</Popup>
        </Marker>
      ))}

      {userLocation && (
        <Marker position={userLocation}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
