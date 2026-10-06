import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io( process.env.VITE_API_URL || "http://localhost:5000", { autoConnect: false });

export default function BusMapTracker({ busId }) {
  const [busData, setBusData] = useState(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Subscribe to bus room
    socket.emit("join_bus", busId);

    // Listen for crowdsourced or driver updates
    socket.on("bus_location_update", (data) => {
      if (data.busId === busId) {
        setBusData(data);
      }
    });

    return () => {
      socket.emit("leave_bus", busId);
      socket.off("bus_location_update");
    };
  }, [busId]);

  if (!busData) return <p>Waiting for live location updates...</p>;

  return (
    <div className="bus-card">
      <h4>Live Bus Status</h4>
      <p>Coordinates: {busData.coordinates[1]}, {busData.coordinates[0]}</p>
      <p>Speed: {busData.speed} km/h</p>
      <p>Source: {busData.source} ({busData.activeRiders} active riders)</p>
      <p>Confidence: <strong>{busData.confidence}</strong></p>
      <small>Last ping: {new Date(busData.updatedAt).toLocaleTimeString()}</small>
    </div>
  );
}