import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const StopMap = ({ latitude, longitude, stopName }) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return (
      <p className="text-sm text-gray-500">
        Location coordinates are not available.
      </p>
    );
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      /* Added 'relative z-0' to trap Leaflet's internal 400-1000 z-indexes */
      className="relative z-0 h-[400px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[latitude, longitude]}>
        <Popup>{stopName}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default StopMap;
