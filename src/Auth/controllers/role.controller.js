import {
  getRolesService,
  getRoleByIdService,
  createRoleService,
  updateRoleService,
  deleteRoleService,
} from "../services/role.service.js";

export const getRoles = async (req, res) => {
  try {
    const result = await getRolesService();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getRoles:", error);
    res.status(500).json({ success: false, message: "Error al obtener los roles", error: error.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const result = await getRoleByIdService(req.params.id);
    res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error in getRoleById:", error);
    res.status(500).json({ success: false, message: "Error al obtener el rol", error: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const result = await createRoleService(req.body);
    res.status(result.status || 201).json(result);
  } catch (error) {
    console.error("Error in createRole:", error);
    res.status(500).json({ success: false, message: "Error al crear el rol", error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const result = await updateRoleService(req.params.id, req.body);
    res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error in updateRole:", error);
    res.status(500).json({ success: false, message: "Error al actualizar el rol", error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const result = await deleteRoleService(req.params.id);
    res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error in deleteRole:", error);
    res.status(500).json({ success: false, message: "Error al eliminar el rol", error: error.message });
  }
};
