const userService = require("../services/userServices");

class UserController {
  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        data: userResponse,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();