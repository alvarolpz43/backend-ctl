import UserModel from "../models/user.model.js";

const getAll = async () => {
  return await UserModel.find()
    .select("-password")
    .populate("role")
    .sort({ createdAt: -1 });
};

const createUser = async (user) => {
  const newUser = new UserModel(user);
  await newUser.save();
  return await UserModel.findById(newUser._id).select("-password").populate("role");
};

const findUserByEmail = async (email) => {
  return await UserModel.findOne({ email }).populate("role");
};

const findUserById = async (id) => {
  return await UserModel.findById(id).select("-password").populate("role");
};

const updateUserRole = async (userId, roleId) => {
  return await UserModel.findByIdAndUpdate(
    userId,
    { role: roleId },
    { new: true }
  )
    .select("-password")
    .populate("role");
};

const updateUser = async (userId, updateData) => {
  return await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  )
    .select("-password")
    .populate("role");
};

const findUserByEmailExcludeId = async (email, excludeUserId) => {
  return await UserModel.findOne({ email, _id: { $ne: excludeUserId } });
};

const deleteUser = async (userId) => {
  return await UserModel.findByIdAndDelete(userId);
};

export default {
  getAll,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByEmailExcludeId,
  updateUserRole,
  updateUser,
  deleteUser,
};
