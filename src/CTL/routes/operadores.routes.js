import { createOperador, deletedOperador, editOperador, getAllOperadores, createOperadoresMasivo } from "../controllers/operadores.controller.js";

import { Router } from "express";
import { registerOperador } from "../schemas/operador.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
const routerOperador = Router();

routerOperador.post("/masivo", createOperadoresMasivo)
routerOperador.get("/", getAllOperadores);
routerOperador.post("/", validateSchema(registerOperador), createOperador);
routerOperador.put("/edit/:id", editOperador);
routerOperador.delete("/:id", deletedOperador);


export default routerOperador;
