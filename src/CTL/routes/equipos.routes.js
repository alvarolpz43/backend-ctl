import { Router } from "express";

import { createEquipo, editEquipo, getAllEquipos, deletedEquipo } from "../controllers/equipos.controller.js";
import { registerEquipo } from "../schemas/equipo.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";


const routerEquipos = Router();

routerEquipos.get("/", getAllEquipos);
routerEquipos.post("/", validateSchema(registerEquipo), createEquipo);
routerEquipos.put("/edit/:id", editEquipo);
routerEquipos.delete("/:id", deletedEquipo);


export default routerEquipos;