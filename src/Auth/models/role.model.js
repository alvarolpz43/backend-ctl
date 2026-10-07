import { Schema, model } from "mongoose";

const ModuloPermisoSchema = new Schema(
  {
    read: { type: Boolean, default: false },
    write: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    permisos: {
      contratistas: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      equipos: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      operadores: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      turnos: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      ubicaciones: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      especies: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      listas: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      roles: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      usuarios: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
      planeacion: { type: ModuloPermisoSchema, default: () => ({ read: false, write: false, update: false, delete: false }) },
    },
  },
  {
    timestamps: true,
  }
);

export default model("roles", RoleSchema);
