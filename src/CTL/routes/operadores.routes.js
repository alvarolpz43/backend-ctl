import { createOperador, editOperador, getAllOperadores } from "../controllers/operadores.controller.js";

import { Router } from "express";
import { registerOperador } from "../schemas/operador.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
const routerOperador = Router();

routerOperador.get("/", getAllOperadores);
routerOperador.post("/", validateSchema(registerOperador), createOperador);
routerOperador.put("edit/:id", editOperador);

export default routerOperador;
