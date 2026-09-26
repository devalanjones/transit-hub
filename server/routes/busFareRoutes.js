const express = require("express")
const { validateFareQuery, validateIdParam, validateCalculateFare, validateUpdateFare, validateCreateBusType } = require("../middleware/validateBusFare")
const { estimateFare, getAllFares, getFareById, calculateFare, updateFare, createBusType } = require("../controllers/busFareController")
const router = express.Router()

router.get("/", getAllFares)
router.get("/estimate", validateFareQuery, estimateFare)

router.post("/", validateCreateBusType, createBusType);
router.post("/fare", validateCalculateFare, calculateFare)

router.get("/:id", validateIdParam, getFareById)
router.put("/:id", validateIdParam, validateUpdateFare, updateFare)

module.exports = router