const Schedule = require("../models/scheduleModel");
const Route = require("../models/routeModel");
const Stop = require("../models/stopModel");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const getDistanceFromSegment = (
  pointLatitude,
  pointLongitude,
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude
) => {

  const latitude = pointLatitude * Math.PI / 180;

  const x = pointLongitude * Math.cos(latitude);
  const y = pointLatitude;

  const startX = startLongitude * Math.cos(latitude);
  const startY = startLatitude;

  const endX = endLongitude * Math.cos(latitude);
  const endY = endLatitude;

  const dx = endX - startX;
  const dy = endY - startY;

  if (dx === 0 && dy === 0) {
    const distanceX = x - startX;
    const distanceY = y - startY;

    return Math.sqrt(
      distanceX * distanceX +
      distanceY * distanceY
    ) * 111320;
  }

  let t =
    ((x - startX) * dx + (y - startY) * dy) /
    (dx * dx + dy * dy);

  t = Math.max(0, Math.min(1, t));

  const closestX = startX + t * dx;
  const closestY = startY + t * dy;

  const distanceX = x - closestX;
  const distanceY = y - closestY;

  return Math.sqrt(
    distanceX * distanceX +
    distanceY * distanceY
  ) * 111320;
};

const getCandidateStopsByRoute = async (routeId) => {

  const route = await Route.findById(routeId).lean();

  if (!route) {
    const error = new Error("Route not found");
    error.status = 404;
    throw error;
  }

  const sourceLatitude = route.source.latitude;
  const sourceLongitude = route.source.longitude;

  const destinationLatitude = route.destination.latitude;
  const destinationLongitude = route.destination.longitude;

  // Get all stops currently available in database
  const stops = await Stop.find().lean();

  if (stops.length === 0) {
    return [];
  }

  // Get the normal source → destination route
  const baseUrl =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${sourceLongitude},${sourceLatitude};` +
    `${destinationLongitude},${destinationLatitude}`;

  const { stdout: baseStdout } = await execFileAsync(
    "curl",
    [
      "-s",
      "--max-time",
      "30",
      "-G",
      baseUrl,
      "--data-urlencode",
      "overview=false",
    ]
  );

  const baseRouteData = JSON.parse(baseStdout);

  if (
    !baseRouteData.routes ||
    baseRouteData.routes.length === 0
  ) {
    const error = new Error("Road route not found");
    error.status = 404;
    throw error;
  }

  const baseDistance =
    baseRouteData.routes[0].distance;

  const candidateStops = [];

  // Check every stop
  for (const stop of stops) {

    const stopUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${sourceLongitude},${sourceLatitude};` +
      `${stop.longitude},${stop.latitude};` +
      `${destinationLongitude},${destinationLatitude}`;

    try {

      const { stdout } = await execFileAsync(
        "curl",
        [
          "-s",
          "--max-time",
          "30",
          "-G",
          stopUrl,
          "--data-urlencode",
          "overview=false",
        ]
      );

      const routeData = JSON.parse(stdout);

      if (
        !routeData.routes ||
        routeData.routes.length === 0
      ) {
        continue;
      }

      const routeDistance =
        routeData.routes[0].distance;

      // Allow routes up to 50% longer than the normal route
      if (routeDistance <= baseDistance * 1.5) {

        candidateStops.push(stop);

      }

    } catch (error) {

      continue;

    }

  }

  return candidateStops;
};

const getRouteGeometryByStops = async (stopIds) => {

  if (!stopIds || stopIds.length < 2) {
    const error = new Error("At least two stops are required");
    error.status = 400;
    throw error;
  }

  const stops = await Stop.find({
    _id: { $in: stopIds }
  }).lean();

  if (stops.length !== stopIds.length) {
    const error = new Error("One or more stops not found");
    error.status = 404;
    throw error;
  }

  // Keep the same order selected by admin
  const orderedStops = stopIds.map((stopId) =>
    stops.find((stop) => stop._id.toString() === stopId.toString())
  );

  const coordinates = orderedStops
    .map((stop) => `${stop.longitude},${stop.latitude}`)
    .join(";");

  const osrmUrl =
    `https://router.project-osrm.org/route/v1/driving/${coordinates}`;

  const { stdout } = await execFileAsync(
    "curl",
    [
      "-s",
      "--max-time",
      "30",
      "-G",
      osrmUrl,
      "--data-urlencode",
      "overview=full",
      "--data-urlencode",
      "geometries=geojson",
    ]
  );

  const routeData = JSON.parse(stdout);

  if (!routeData.routes || routeData.routes.length === 0) {
    const error = new Error("Road route not found");
    error.status = 404;
    throw error;
  }

  return {
    geometry: routeData.routes[0].geometry,
    distance: routeData.routes[0].distance,
    duration: routeData.routes[0].duration,
  };
};

const createSchedule = async (data) => {
  return await Schedule.create(data)
}
const getAllSchedules = async () => {
  return await Schedule.find()
    .populate("busId")
    .populate("routeId")
    .populate("stops.stopId")
    .lean();
};

const getScheduleById = async (id) => {
  const schedule = await Schedule.findById(id)
    .populate({
      path: "busId",
      populate: {
        path: "busType"
      }
    })
    .populate("routeId")
    .populate("stops.stopId")
    .lean();

  if (!schedule) {
    const error = new Error("Schedule not found");
    error.status = 404;
    throw error;
  }

  return schedule;
};

const getAssignedSchedulesByBus = async (busId) => {

  const now = new Date();

  const currentDay = now.toLocaleDateString("en-US", {
    weekday: "long"
  });

  const currentTime = now.toTimeString().slice(0, 5);

  const schedules = await Schedule.find({
    busId,
  })
    .populate("routeId", "routeName startLocation endLocation")
    .populate("stops.stopId", "stopName location")
    .sort({
      departureTime: 1
    });

  return schedules;

};

const getSchedulesByRoute = async (routeId) => {

  const schedules = await Schedule.find({
    routeId
  })
    .populate({
      path: "busId",
      populate: {
        path: "busType"
      }
    })
    .populate("routeId")
    .sort({
      departureTime: 1
    });

  return schedules;
};

const getSchedulesByStop = async (stopId) => {

  const schedules = await Schedule.find({
    "stops.stopId": stopId
  })
    .populate({
      path: "busId",
      populate: {
        path: "busType"
      }
    })
    .populate("routeId")
    .populate("stops.stopId")
    .sort({
      departureTime: 1
    });

  return schedules;

};

const updateSchedule = async (id, data) => {
  const updatedSchedule = await Schedule.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!updatedSchedule) {
    const error = new Error("Schedule not found");
    error.status = 404;
    throw error;
  }

  return updatedSchedule;
};

const deleteSchedule = async (id) => {
  const deletedSchedule = await Schedule.findByIdAndDelete(id);

  if (!deletedSchedule) {
    const error = new Error("Schedule not found");
    error.status = 404;
    throw error;
  }

  return deletedSchedule;
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  getAssignedSchedulesByBus,
  getSchedulesByRoute,
  getSchedulesByStop,
  getCandidateStopsByRoute,
  getRouteGeometryByStops,
  updateSchedule,
  deleteSchedule,
};