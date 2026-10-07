import {
  getUser,
  insertUser,
  findUsers,
  loginUser,
  VerifyAuthUser,
  updateUserRoleService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";

export const registerUsers = async (req, res) => {
  try {
    const result = await insertUser(req.body);
    res.status(result.status || 201).json(result);
  } catch (error) {
    console.error("Error in registerUsers:", error);
    res.status(500).json({ success: false, message: "Error al registrar usuario", error: error.message });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const result = await getUser(req.params.email || req.body.email);
    res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error in getUserDetail:", error);
    res.status(500).json({ success: false, message: "Error al obtener usuario", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await findUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ success: false, message: "Error al obtener usuarios", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await loginUser(email, password);

    if (response.success) {
      res.cookie("token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(200).json(response);
    }

    return res.status(response.status || 401).json(response);
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Error en el inicio de sesión", error: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Formato de token inválido" });
    }

    const response = await VerifyAuthUser(token);
    res.status(response.status || 200).json(response);
  } catch (error) {
    console.error("Error in verifyToken:", error);
    res.status(500).json({ success: false, message: "Error al verificar token", error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    if (!roleId) {
      return res.status(400).json({ success: false, message: "El ID del rol es obligatorio" });
    }
    const result = await updateUserRoleService(id, roleId);
    res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    res.status(500).json({ success: false, message: "Error al actualizar rol del usuario", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateUserService(id, req.body);
    res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ success: false, message: "Error al actualizar usuario", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?._id;
    const result = await deleteUserService(id, currentUserId);
    res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ success: false, message: "Error al eliminar usuario", error: error.message });
  }
};
