import { Router } from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";
import { authMiddleware } from "../../Middleware/ValidateAuth.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const router = Router();

router.use(authMiddleware);

router.get("/", checkPermission("roles", "read"), getRoles);
router.get("/:id", checkPermission("roles", "read"), getRoleById);
router.post("/", checkPermission("roles", "write"), createRole);
router.put("/:id", checkPermission("roles", "update"), updateRole);
router.delete("/:id", checkPermission("roles", "delete"), deleteRole);

export default router;
