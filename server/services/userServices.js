const User = require("../models/userModel");

class UserService {
  async createUser(userData) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }
    return await User.create(userData);
  }

  async getAllUsers() {
    return await User.find().select("-password");
  }

  async getUserById(id) {
    const user = await User.findById(id).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUser(id, updateData) {
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new UserService();