import {
  createNucleo,
  editNucleo,
  getAllNucleos,
  deletedNucleo,
} from "../controllers/nucleos.controller.js";
import { Router } from "express";
import { registerNucleo } from "../schemas/nucleo.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerNucleo = Router();

routerNucleo.get("/", checkPermission("ubicaciones", "read"), getAllNucleos);
routerNucleo.post("/", checkPermission("ubicaciones", "write"), validateSchema(registerNucleo), createNucleo);
routerNucleo.put("/edit/:id", checkPermission("ubicaciones", "update"), editNucleo);
routerNucleo.delete("/:id", checkPermission("ubicaciones", "delete"), deletedNucleo);

export default routerNucleo;
