const Route = require("../models/routeModel");

const getCoordinates = async (placeName) => {

  let url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(placeName)}` +
    `&format=jsonv2` +
    `&limit=1` +
    `&countrycodes=in`;

  let response = await fetch(url, {
    headers: {
      "User-Agent": "TransitHub/1.0",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get location coordinates");
  }

  let results = await response.json();

  if (!results.length) {
    throw new Error(`Location not found: ${placeName}`);
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
  };
};

const createRoute = async (data) => {

  let sourceCoordinates = await getCoordinates(data.source);

  let destinationCoordinates = await getCoordinates(data.destination);

  let routeData = {
    routeName: data.routeName,

    source: {
      name: data.source,
      latitude: sourceCoordinates.latitude,
      longitude: sourceCoordinates.longitude,
    },

    destination: {
      name: data.destination,
      latitude: destinationCoordinates.latitude,
      longitude: destinationCoordinates.longitude,
    },
  };

  return await Route.create(routeData);
};

const getAllRoutes = async () => {
  return await Route.find().sort({ createdAt: -1 });
};

const getRouteById = async (id) => {
  return await Route.findById(id);
};

const updateRoute = async (id, data) => {
  return await Route.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
};

const deleteRoute = async (id) => {
  return await Route.findByIdAndDelete(id);
};

module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
};
