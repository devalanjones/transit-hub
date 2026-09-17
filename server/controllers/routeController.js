const routeService = require("../services/routeServices");

let createRoute = async (req, res) => {
  try {
    const route = await routeService.createRoute(req.body);

    return res.status(201).json({
      success: true,
      message: "Route created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

let getAllRoutes = async (req, res) => {
  try {
    let routes = await routeService.getAllRoutes();
    res.json({
      success: true,
      data: routes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

let getRouteById = async (req, res) => {
  try {
    let route = await routeService.getRouteById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.json({
      success: true,
      data: route,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

let updateRoute = async (req, res) => {
  try {
    let route = await routeService.updateRoute(req.params.id, req.body);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.json({
      success: true,
      message: "Route updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

let deleteRoute = async (req, res) => {
  try {
    let route = await routeService.deleteRoute(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
}