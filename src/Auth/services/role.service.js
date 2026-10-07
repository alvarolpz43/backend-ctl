import RoleRepository from "../repositories/role.repository.js";

const DEFAULT_MODULES = [
  "contratistas",
  "equipos",
  "operadores",
  "turnos",
  "ubicaciones",
  "especies",
  "listas",
  "roles",
  "usuarios",
  "planeacion",
];

const normalizePermissions = (permisos = {}) => {
  const result = {};
  for (const mod of DEFAULT_MODULES) {
    result[mod] = {
      read: Boolean(permisos[mod]?.read),
      write: Boolean(permisos[mod]?.write),
      update: Boolean(permisos[mod]?.update),
      delete: Boolean(permisos[mod]?.delete),
    };
  }
  return result;
};

export const getRolesService = async () => {
  const roles = await RoleRepository.getAll();
  const rolesWithCount = await Promise.all(
    roles.map(async (role) => {
      const usersCount = await RoleRepository.countUsersWithRole(role._id);
      return {
        ...role.toObject(),
        usersCount,
      };
    })
  );
  return { success: true, data: rolesWithCount };
};

export const getRoleByIdService = async (id) => {
  const role = await RoleRepository.findById(id);
  if (!role) {
    return { success: false, message: "Rol no encontrado", status: 404 };
  }
  const usersCount = await RoleRepository.countUsersWithRole(role._id);
  return {
    success: true,
    data: {
      ...role.toObject(),
      usersCount,
    },
  };
};

export const createRoleService = async (data) => {
  const { name, description, permisos, isSystem } = data;
  if (!name || !name.trim()) {
    return { success: false, message: "El nombre del rol es obligatorio", status: 400 };
  }

  const existing = await RoleRepository.findByName(name.trim());
  if (existing) {
    return { success: false, message: `El rol "${name}" ya existe`, status: 400 };
  }

  const cleanPermisos = normalizePermissions(permisos);
  const newRole = await RoleRepository.create({
    name: name.trim(),
    description: description?.trim() || "",
    isSystem: Boolean(isSystem),
    permisos: cleanPermisos,
  });

  return { success: true, message: "Rol creado exitosamente", data: newRole };
};

export const updateRoleService = async (id, data) => {
  const role = await RoleRepository.findById(id);
  if (!role) {
    return { success: false, message: "Rol no encontrado", status: 404 };
  }

  const { name, description, permisos } = data;
  const updateData = {};

  if (name && name.trim() !== role.name) {
    const existing = await RoleRepository.findByName(name.trim());
    if (existing && existing._id.toString() !== id) {
      return { success: false, message: `El rol "${name}" ya existe`, status: 400 };
    }
    // Si es un rol de sistema como Administrador, se previene renombrar para mantener compatibilidad
    if (role.isSystem && role.name === "Administrador") {
      return { success: false, message: "No se puede renombrar el rol Administrador del sistema", status: 400 };
    }
    updateData.name = name.trim();
  }

  if (description !== undefined) {
    updateData.description = description.trim();
  }

  if (permisos) {
    // Si es rol Administrador del sistema, mantenemos todos los permisos activos
    if (role.isSystem && role.name === "Administrador") {
      updateData.permisos = normalizePermissions();
      for (const m of DEFAULT_MODULES) {
        updateData.permisos[m] = { read: true, write: true, update: true, delete: true };
      }
    } else {
      updateData.permisos = normalizePermissions(permisos);
    }
  }

  const updated = await RoleRepository.update(id, updateData);
  return { success: true, message: "Rol actualizado exitosamente", data: updated };
};

export const deleteRoleService = async (id) => {
  const role = await RoleRepository.findById(id);
  if (!role) {
    return { success: false, message: "Rol no encontrado", status: 404 };
  }

  if (role.isSystem) {
    return { success: false, message: "No se pueden eliminar roles protegidos del sistema", status: 400 };
  }

  const usersCount = await RoleRepository.countUsersWithRole(id);
  if (usersCount > 0) {
    return {
      success: false,
      message: `No se puede eliminar el rol porque está asignado a ${usersCount} usuario(s)`,
      status: 400,
    };
  }

  await RoleRepository.deleteById(id);
  return { success: true, message: "Rol eliminado exitosamente" };
};
