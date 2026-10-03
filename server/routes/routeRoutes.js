let express = require("express");
const {
  validateRoute,
  validateUpdateRoute,
} = require("../middlewares/validateRoute");
const {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeController");
const router = express.Router();

router.post("/", validateRoute, createRoute);
router.get("/", getAllRoutes);
router.get("/:id", getRouteById);
router.put("/:id", validateUpdateRoute, updateRoute);
router.delete("/:id", deleteRoute);

module.exports = router;
