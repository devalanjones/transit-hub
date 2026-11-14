const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validate = require("../middlewares/validate");
const {
  registerSchema,
  updateUserSchema,
} = require("../validations/userValidation");

router
  .route("/")
  .post(validate(registerSchema), userController.create)
  .get(userController.getAll);

router
  .route("/:id")
  .get(userController.getById)
  .put(validate(updateUserSchema), userController.update)
  .delete(userController.remove);

module.exports = router;