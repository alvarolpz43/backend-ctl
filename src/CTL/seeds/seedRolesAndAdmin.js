import mongoose from "mongoose";
import RoleModel from "../../Auth/models/role.model.js";
import UserModel from "../../Auth/models/user.model.js";
import { hash } from "bcryptjs";

const MODULES = [
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

const createFullPermissions = () => {
  const p = {};
  for (const mod of MODULES) {
    p[mod] = { read: true, write: true, update: true, delete: true };
  }
  return p;
};

const createSupervisorPermissions = () => {
  const p = {};
  for (const mod of MODULES) {
    if (mod === "roles" || mod === "usuarios") {
      p[mod] = { read: true, write: false, update: false, delete: false };
    } else {
      p[mod] = { read: true, write: true, update: true, delete: false };
    }
  }
  return p;
};

const createOperadorPermissions = () => {
  const p = {};
  for (const mod of MODULES) {
    if (mod === "listas") {
      p[mod] = { read: true, write: true, update: false, delete: false };
    } else if (mod === "turnos" || mod === "equipos") {
      p[mod] = { read: true, write: false, update: false, delete: false };
    } else {
      p[mod] = { read: false, write: false, update: false, delete: false };
    }
  }
  return p;
};

const createConsultaPermissions = () => {
  const p = {};
  for (const mod of MODULES) {
    p[mod] = { read: true, write: false, update: false, delete: false };
  }
  return p;
};

export const seedRolesAndAdmin = async () => {
  console.log("🌱 Inicializando roles y usuario administrador...");

  // 1. Rol Administrador
  let adminRole = await RoleModel.findOne({ name: "Administrador" });
  if (!adminRole) {
    adminRole = await RoleModel.create({
      name: "Administrador",
      description: "Acceso total y configuración del sistema",
      isSystem: true,
      permisos: createFullPermissions(),
    });
    console.log("✅ Rol 'Administrador' creado.");
  } else {
    // Asegurar que tenga todos los permisos
    adminRole.permisos = createFullPermissions();
    adminRole.isSystem = true;
    await adminRole.save();
    console.log("ℹ️ Rol 'Administrador' actualizado con permisos completos.");
  }

  // 2. Rol Supervisor
  let supRole = await RoleModel.findOne({ name: "Supervisor" });
  if (!supRole) {
    supRole = await RoleModel.create({
      name: "Supervisor",
      description: "Gestión operativa completa de contratistas, equipos, operadores y turnos",
      isSystem: false,
      permisos: createSupervisorPermissions(),
    });
    console.log("✅ Rol 'Supervisor' creado.");
  }

  // 3. Rol Operador de Campo
  let opRole = await RoleModel.findOne({ name: "Operador de Campo" });
  if (!opRole) {
    opRole = await RoleModel.create({
      name: "Operador de Campo",
      description: "Acceso para diligenciar información operacional y consultar turnos/equipos",
      isSystem: false,
      permisos: createOperadorPermissions(),
    });
    console.log("✅ Rol 'Operador de Campo' creado.");
  }

  // 4. Rol Consulta / Auditor
  let auditRole = await RoleModel.findOne({ name: "Consulta" });
  if (!auditRole) {
    auditRole = await RoleModel.create({
      name: "Consulta",
      description: "Solo lectura en todos los módulos",
      isSystem: false,
      permisos: createConsultaPermissions(),
    });
    console.log("✅ Rol 'Consulta' creado.");
  }

  // 5. Asignar rol Administrador al usuario admin@ctl.com
  let adminUser = await UserModel.findOne({ email: "admin@ctl.com" });
  if (adminUser) {
    adminUser.role = adminRole._id;
    await adminUser.save();
    console.log(`✅ Usuario "${adminUser.email}" actualizado con rol "Administrador".`);
  } else {
    const passwordHashed = await hash("123456", 10);
    adminUser = await UserModel.create({
      name: "Administrador General",
      email: "admin@ctl.com",
      password: passwordHashed,
      role: adminRole._id,
    });
    console.log(`✅ Usuario "${adminUser.email}" creado con rol "Administrador".`);
  }

  return { adminRole, supRole, opRole, auditRole, adminUser };
};

// Si se ejecuta directamente desde CLI
if (process.argv[1]?.endsWith("seedRolesAndAdmin.js")) {
  const mongoUrl = process.env.MONGODB_URL_CTL;
  if (!mongoUrl) {
    console.error("MONGODB_URL_CTL no está definido");
    process.exit(1);
  }
  mongoose
    .connect(mongoUrl)
    .then(() => seedRolesAndAdmin())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error("Error en seedRolesAndAdmin:", err);
      process.exit(1);
    });
}
