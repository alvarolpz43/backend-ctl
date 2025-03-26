import { createZona, editZona, getAllZonas } from "../controllers/zonas.controller.js";

import { Router } from "express";
import { registerZona } from "../schemas/zona.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
const routerZona = Router();

routerZona.get("/", getAllZonas);
routerZona.post("/", validateSchema(registerZona), createZona);
routerZona.put("edit/:id", editZona);

export default routerZona;
