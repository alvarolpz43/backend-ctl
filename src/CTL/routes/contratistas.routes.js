import Router from "express";
import {
  getAllContratistas,
  postContratista,
  editContratista,
  deletedContratista,
  getContratistaById,
} from "../controllers/contratistas.controller.js";
import { registerContratista } from "../schemas/contratista.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerContts = Router();

routerContts.get("/", checkPermission("contratistas", "read"), getAllContratistas);
routerContts.get("/:id", checkPermission("contratistas", "read"), getContratistaById);
routerContts.post("/", checkPermission("contratistas", "write"), validateSchema(registerContratista), postContratista);
routerContts.put("/edit/:id", checkPermission("contratistas", "update"), editContratista);
routerContts.delete("/:id", checkPermission("contratistas", "delete"), deletedContratista);

export default routerContts;
