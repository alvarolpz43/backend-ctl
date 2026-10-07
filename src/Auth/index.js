import { Router } from "express";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";

const routerAuth = Router();

routerAuth.use('/users', userRoutes);
routerAuth.use('/roles', roleRoutes);
export default routerAuth;