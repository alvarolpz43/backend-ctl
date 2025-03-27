import { createNucleo, editNucleo, getAllNucleos, deletedNucleo } from "../controllers/nucleos.controller.js";

import { Router } from "express";
import { registerNucleo } from "../schemas/nucleo.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
const routerNucleo = Router();

routerNucleo.get("/", getAllNucleos);
routerNucleo.post("/", validateSchema(registerNucleo), createNucleo);
routerNucleo.put("/edit/:id", editNucleo);
routerNucleo.delete("/:id", deletedNucleo);


export default routerNucleo;

