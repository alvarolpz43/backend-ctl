import { createEspecie, editEspecie, getAllEspecies } from "../controllers/especies.controller.js";

import { Router } from "express";
import { registerEspecie } from "../schemas/especie.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
const routerEspecie = Router();

routerEspecie.get("/", getAllEspecies);
routerEspecie.post("/", validateSchema(registerEspecie), createEspecie);
routerEspecie.put("edit/:id", editEspecie);

export default routerEspecie;

