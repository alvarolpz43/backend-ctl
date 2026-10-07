import { Router } from "express";
import {
  createEquipo,
  editEquipo,
  getAllEquipos,
  deletedEquipo,
} from "../controllers/equipos.controller.js";
import { registerEquipo } from "../schemas/equipo.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerEquipos = Router();

routerEquipos.get("/", checkPermission("equipos", "read"), getAllEquipos);
routerEquipos.post("/", checkPermission("equipos", "write"), validateSchema(registerEquipo), createEquipo);
routerEquipos.put("/edit/:id", checkPermission("equipos", "update"), editEquipo);
routerEquipos.delete("/:id", checkPermission("equipos", "delete"), deletedEquipo);

export default routerEquipos;