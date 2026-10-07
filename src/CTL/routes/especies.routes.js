import {
  createEspecie,
  editEspecie,
  getAllEspecies,
  deletedEspecie,
} from "../controllers/especies.controller.js";
import { Router } from "express";
import { registerEspecie } from "../schemas/especie.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerEspecie = Router();

routerEspecie.get("/", checkPermission("especies", "read"), getAllEspecies);
routerEspecie.post("/", checkPermission("especies", "write"), validateSchema(registerEspecie), createEspecie);
routerEspecie.put("/edit/:id", checkPermission("especies", "update"), editEspecie);
routerEspecie.delete("/:id", checkPermission("especies", "delete"), deletedEspecie);

export default routerEspecie;
