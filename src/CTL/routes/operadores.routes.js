import { Router } from "express";
import {
  createOperador,
  deletedOperador,
  editOperador,
  getAllOperadores,
  createOperadoresMasivo,
} from "../controllers/operadores.controller.js";
import { registerOperador } from "../schemas/operador.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerOperador = Router();

routerOperador.get("/", checkPermission("operadores", "read"), getAllOperadores);
routerOperador.post("/masivo", checkPermission("operadores", "write"), createOperadoresMasivo);
routerOperador.post("/", checkPermission("operadores", "write"), validateSchema(registerOperador), createOperador);
routerOperador.put("/edit/:id", checkPermission("operadores", "update"), editOperador);
routerOperador.delete("/:id", checkPermission("operadores", "delete"), deletedOperador);

export default routerOperador;
