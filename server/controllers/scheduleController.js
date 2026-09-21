const scheduleService = require("../services/scheduleServices");

let createSchedule = async (req, res) => {
  try {
    await scheduleService.createSchedule(req.body);

    return res.status(201).json({
      success: true,
      message: "Schedule created successfully",
    });
  } catch (err) {
    if (err.message === "Schedule already exists") {
      return res.status(409).json({
        success: false,
        message: "Schedule for this bus and route already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

let getAllSchedules = async (req, res) => {
  try {
    const schedules = await scheduleService.getAllSchedules();

    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

let getScheduleById = async (req, res) => {
  try {
    const schedule = await scheduleService.getScheduleById(req.params.id);

    return res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

let updateSchedule = async (req, res) => {
  try {
    await scheduleService.updateSchedule(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

let deleteSchedule = async (req, res) => {
  try {
    await scheduleService.deleteSchedule(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

let getAssignedSchedulesByBus = async (req, res) => {

  try {

    const { busId } = req.params;

    const assignedSchedules =
      await scheduleService.getAssignedSchedulesByBus(busId);

    return res.status(200).json({

      success: true,

      count: assignedSchedules.length,

      data: assignedSchedules,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

let getSchedulesByRoute = async (req, res) => {

  try {

    const { routeId } = req.params;

    const schedules =
      await scheduleService.getSchedulesByRoute(routeId);

    return res.status(200).json({

      success: true,

      count: schedules.length,

      data: schedules

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

let getCandidateStopsByRoute = async (req, res) => {

  try {

    const { routeId } = req.params;

    const candidateStops =
      await scheduleService.getCandidateStopsByRoute(routeId);

    return res.status(200).json({

      success: true,

      count: candidateStops.length,

      data: candidateStops,

    });

  } catch (error) {

    return res.status(error.status || 500).json({

      success: false,

      message: error.message,

    });

  }

};

let getSchedulesByStop = async (req, res) => {

  try {

    const { stopId } = req.params;

    const schedules =
      await scheduleService.getSchedulesByStop(stopId);

    return res.status(200).json({

      success: true,

      count: schedules.length,

      data: schedules

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

let getRouteGeometryByStops = async (req, res) => {

  try {

    const { stopIds } = req.body;

    const routeGeometry =
      await scheduleService.getRouteGeometryByStops(stopIds);

    return res.status(200).json({
      success: true,
      data: routeGeometry,
    });

  } catch (error) {

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getAssignedSchedulesByBus,
  getSchedulesByRoute,
  getSchedulesByStop,
  getCandidateStopsByRoute,
  getRouteGeometryByStops,
};
