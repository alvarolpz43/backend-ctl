import { Router } from "express";
import {
  registerUsers,
  getAllUsers,
  login,
  verifyToken,
  updateUserRole,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { registerUserSchema, loginSchema } from "../schema/user.schema.js";
import { authMiddleware } from "../../Middleware/ValidateAuth.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const router = Router();

// Rutas públicas
router.post("/login", validateSchema(loginSchema), login);
router.post("/verify", verifyToken);

// Rutas protegidas para administración de usuarios
router.get("/", authMiddleware, checkPermission("usuarios", "read"), getAllUsers);
router.post("/register", authMiddleware, checkPermission("usuarios", "write"), validateSchema(registerUserSchema), registerUsers);
router.put("/:id/role", authMiddleware, checkPermission("usuarios", "update"), updateUserRole);
router.put("/:id", authMiddleware, checkPermission("usuarios", "update"), updateUser);
router.delete("/:id", authMiddleware, checkPermission("usuarios", "delete"), deleteUser);

export default router;
