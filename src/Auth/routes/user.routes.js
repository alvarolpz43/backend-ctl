import { Router } from "express";
import {
    registerUsers,
    getAllUsers,
    login,
    verifyToken,
} from "../controllers/user.controller.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { registerUserSchema, loginSchema } from "../schema/user.schema.js";
import { authMiddleware } from "../../Middleware/ValidateAuth.js";

const router = Router();

router.post("/login", validateSchema(loginSchema), login);

router.get("/", getAllUsers);

router.post("/verify", verifyToken);

router.post("/", validateSchema(registerUserSchema), registerUsers);

// router.get("/:id", authMiddleware, getUserById);

// router.put("/edit/:id", authMiddleware, editUser);

export default router;


