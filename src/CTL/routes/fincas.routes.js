import { createFinca, deletedFinca, editFinca, getAllFincas, createMasiveFincas } from "../controllers/fincas.controller.js";

import { Router } from "express";
import { registerFinca } from "../schemas/finca.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
const routerFinca = Router();

routerFinca.get("/", getAllFincas);
routerFinca.post("/", validateSchema(registerFinca), createFinca);
routerFinca.post("/masive", createMasiveFincas);

routerFinca.put("/edit/:id", editFinca);
routerFinca.delete("/:id", deletedFinca);

export default routerFinca;

