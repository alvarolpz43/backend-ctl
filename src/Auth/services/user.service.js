import { hash, compare } from "bcryptjs";
import UserRepository from "../repositories/user.repository.js";
import RoleRepository from "../repositories/role.repository.js";
import { createAccessToken } from "../libs/jwt.js";
import { validateToken } from "../../Middleware/ValidateAuth.js";

const formatUserResponse = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : user;
  const { password, ...safeUser } = userObj;
  return {
    ...safeUser,
    todosLosContratistas: safeUser.todosLosContratistas !== false,
    contratistas: Array.isArray(safeUser.contratistas) ? safeUser.contratistas : [],
    permisos: safeUser.role?.permisos || {},
  };
};

const insertUser = async (user) => {
  const { name, email, password, roleId, todosLosContratistas, contratistas } = user;
  const emailExist = await UserRepository.findUserByEmail(email);

  if (emailExist) {
    return {
      success: false,
      message: "El correo electrónico ya se encuentra registrado",
      status: 400,
    };
  }

  let assignedRole = null;
  if (roleId) {
    assignedRole = await RoleRepository.findById(roleId);
    if (!assignedRole) {
      return {
        success: false,
        message: "El rol especificado no existe",
        status: 400,
      };
    }
  } else {
    // Buscar rol por defecto (Operador o Consulta)
    const defaultRole = await RoleRepository.findByName("Operador de Campo") || await RoleRepository.findByName("Consulta");
    if (defaultRole) {
      assignedRole = defaultRole;
    }
  }

  const isGeneral = todosLosContratistas !== false;
  const cleanContratistas = !isGeneral && Array.isArray(contratistas) ? contratistas : [];

  const passwordHashed = await hash(password, 10);
  const newUserPayload = {
    name,
    email,
    password: passwordHashed,
    role: assignedRole ? assignedRole._id : undefined,
    todosLosContratistas: isGeneral,
    contratistas: cleanContratistas,
  };

  const userRegistered = await UserRepository.createUser(newUserPayload);

  return {
    success: true,
    message: "Usuario registrado exitosamente",
    data: formatUserResponse(userRegistered),
  };
};

const getUser = async (email) => {
  const response = await UserRepository.findUserByEmail(email);
  if (!response) {
    return { success: false, message: "Usuario no encontrado", status: 404 };
  }
  return {
    success: true,
    message: "User Found",
    data: formatUserResponse(response),
  };
};

const findUsers = async () => {
  const response = await UserRepository.getAll();
  const formatted = response.map(formatUserResponse);
  return {
    success: true,
    data: formatted,
  };
};

const loginUser = async (email, password) => {
  const userExist = await UserRepository.findUserByEmail(email);
  if (!userExist) {
    return {
      success: false,
      message: "Credenciales inválidas",
      status: 401,
    };
  }

  const match = await compare(password, userExist.password);
  if (!match) {
    return {
      success: false,
      message: "Credenciales inválidas",
      status: 401,
    };
  }

  const payload = {
    userId: userExist._id,
    email: userExist.email,
  };

  const token = await createAccessToken(payload);
  const userFormatted = formatUserResponse(userExist);

  return {
    success: true,
    message: "Inicio de sesión exitoso",
    token,
    user: userFormatted,
  };
};

const VerifyAuthUser = async (token) => {
  const responseValidation = validateToken(token);

  if (!responseValidation) {
    return {
      success: false,
      message: "Token inválido o expirado",
      status: 401,
    };
  }

  const user = await UserRepository.findUserById(responseValidation.userId);
  if (!user) {
    return {
      success: false,
      message: "Usuario no encontrado",
      status: 404,
    };
  }

  return {
    success: true,
    user: formatUserResponse(user),
  };
};

const updateUserRoleService = async (userId, roleId) => {
  const role = await RoleRepository.findById(roleId);
  if (!role) {
    return { success: false, message: "El rol seleccionado no existe", status: 404 };
  }

  const user = await UserRepository.findUserById(userId);
  if (!user) {
    return { success: false, message: "Usuario no encontrado", status: 404 };
  }

  const updated = await UserRepository.updateUserRole(userId, roleId);
  return {
    success: true,
    message: "Rol de usuario actualizado exitosamente",
    data: formatUserResponse(updated),
  };
};

const updateUserService = async (userId, updatePayload) => {
  const user = await UserRepository.findUserById(userId);
  if (!user) {
    return { success: false, message: "Usuario no encontrado", status: 404 };
  }

  const updates = {};

  if (updatePayload.name !== undefined) {
    const trimmedName = updatePayload.name.trim();
    if (!trimmedName) {
      return { success: false, message: "El nombre no puede estar vacío", status: 400 };
    }
    updates.name = trimmedName;
  }

  if (updatePayload.email !== undefined) {
    const trimmedEmail = updatePayload.email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, message: "El correo electrónico no puede estar vacío", status: 400 };
    }
    const duplicate = await UserRepository.findUserByEmailExcludeId(trimmedEmail, userId);
    if (duplicate) {
      return {
        success: false,
        message: "El correo electrónico ya está registrado por otro usuario",
        status: 400,
      };
    }
    updates.email = trimmedEmail;
  }

  if (updatePayload.password && updatePayload.password.trim()) {
    if (updatePayload.password.trim().length < 4) {
      return { success: false, message: "La contraseña debe tener al menos 4 caracteres", status: 400 };
    }
    updates.password = await hash(updatePayload.password.trim(), 10);
  }

  if (updatePayload.roleId) {
    const role = await RoleRepository.findById(updatePayload.roleId);
    if (!role) {
      return { success: false, message: "El rol seleccionado no existe", status: 404 };
    }
    updates.role = role._id;
  }

  if (updatePayload.todosLosContratistas !== undefined) {
    const isGeneral = updatePayload.todosLosContratistas !== false;
    updates.todosLosContratistas = isGeneral;
    if (isGeneral) {
      updates.contratistas = [];
    } else if (Array.isArray(updatePayload.contratistas)) {
      updates.contratistas = updatePayload.contratistas;
    }
  } else if (updatePayload.contratistas !== undefined) {
    updates.contratistas = Array.isArray(updatePayload.contratistas) ? updatePayload.contratistas : [];
  }

  const updated = await UserRepository.updateUser(userId, updates);
  return {
    success: true,
    message: "Usuario actualizado exitosamente",
    data: formatUserResponse(updated),
  };
};

const deleteUserService = async (userId, currentUserId) => {
  if (userId.toString() === currentUserId?.toString()) {
    return {
      success: false,
      message: "No puedes eliminar tu propia cuenta de usuario",
      status: 400,
    };
  }

  const user = await UserRepository.findUserById(userId);
  if (!user) {
    return { success: false, message: "Usuario no encontrado", status: 404 };
  }

  await UserRepository.deleteUser(userId);
  return {
    success: true,
    message: "Usuario eliminado exitosamente",
  };
};

export {
  insertUser,
  getUser,
  findUsers,
  loginUser,
  VerifyAuthUser,
  updateUserRoleService,
  updateUserService,
  deleteUserService,
};
