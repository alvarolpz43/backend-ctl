import {
  createZona,
  deletedZona,
  editZona,
  getAllZonas,
} from "../controllers/zonas.controller.js";
import { Router } from "express";
import { registerZona } from "../schemas/zona.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerZona = Router();

routerZona.get("/", checkPermission("ubicaciones", "read"), getAllZonas);
routerZona.post("/", checkPermission("ubicaciones", "write"), validateSchema(registerZona), createZona);
routerZona.put("/edit/:id", checkPermission("ubicaciones", "update"), editZona);
routerZona.put("/:id", checkPermission("ubicaciones", "delete"), deletedZona);

export default routerZona;
