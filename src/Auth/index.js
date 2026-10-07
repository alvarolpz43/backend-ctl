import { Router } from "express";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import { login } from "./controllers/user.controller.js";
import { validateSchema } from "../Middleware/ValidatorSchema.js";
import { loginSchema } from "./schema/user.schema.js";

const routerAuth = Router();

// Alias directo para POST /auth/login
routerAuth.post('/login', validateSchema(loginSchema), login);

routerAuth.use('/users', userRoutes);
routerAuth.use('/roles', roleRoutes);

export default routerAuth;