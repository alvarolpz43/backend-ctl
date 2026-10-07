import RoleModel from "../models/role.model.js";
import UserModel from "../models/user.model.js";

const getAll = async () => {
  return await RoleModel.find().sort({ createdAt: -1 });
};

const findById = async (id) => {
  return await RoleModel.findById(id);
};

const findByName = async (name) => {
  return await RoleModel.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
};

const create = async (data) => {
  const newRole = new RoleModel(data);
  return await newRole.save();
};

const update = async (id, data) => {
  return await RoleModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteById = async (id) => {
  return await RoleModel.findByIdAndDelete(id);
};

const countUsersWithRole = async (roleId) => {
  return await UserModel.countDocuments({ role: roleId });
};

export default {
  getAll,
  findById,
  findByName,
  create,
  update,
  deleteById,
  countUsersWithRole,
};
