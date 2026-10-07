import {
  createFinca,
  deletedFinca,
  editFinca,
  getAllFincas,
  createMasiveFincas,
} from "../controllers/fincas.controller.js";
import { Router } from "express";
import { registerFinca } from "../schemas/finca.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerFinca = Router();

routerFinca.get("/", checkPermission("ubicaciones", "read"), getAllFincas);
routerFinca.post("/", checkPermission("ubicaciones", "write"), validateSchema(registerFinca), createFinca);
routerFinca.post("/masive", checkPermission("ubicaciones", "write"), createMasiveFincas);
routerFinca.put("/edit/:id", checkPermission("ubicaciones", "update"), editFinca);
routerFinca.delete("/:id", checkPermission("ubicaciones", "delete"), deletedFinca);

export default routerFinca;
