import {
  createTurno,
  editTurno,
  getAllTurnos,
  deletedTurno,
} from "../controllers/turnos.controller.js";
import { Router } from "express";
import { registerTurno } from "../schemas/turno.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerTurno = Router();

routerTurno.get("/", checkPermission("turnos", "read"), getAllTurnos);
routerTurno.post("/", checkPermission("turnos", "write"), validateSchema(registerTurno), createTurno);
routerTurno.put("/edit/:id", checkPermission("turnos", "update"), editTurno);
routerTurno.delete("/:id", checkPermission("turnos", "delete"), deletedTurno);

export default routerTurno;
