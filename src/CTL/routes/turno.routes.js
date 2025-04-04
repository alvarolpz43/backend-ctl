import { createTurno, editTurno, getAllTurnos, deletedTurno } from "../controllers/turnos.controller.js";

import { Router } from "express";
import { registerTurno } from "../schemas/turno.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
const routerTurno = Router();

routerTurno.get("/", getAllTurnos);
routerTurno.post("/", validateSchema(registerTurno), createTurno);
routerTurno.put("/edit/:id", editTurno);
routerTurno.delete("/:id", deletedTurno);


export default routerTurno;
