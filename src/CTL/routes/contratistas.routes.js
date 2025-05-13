import Router from "express";

import { getAllContratistas, postContratista, editContratista, deletedContratista, getContratistaById } from "../controllers/contratistas.controller.js";
import { registerContratista } from "../schemas/contratista.schema.js"
import { validateSchema } from "../../Middleware/ValidatorSchema.js";

const routerContts = Router();
routerContts.put("/edit/:id", editContratista);
routerContts.delete("/:id", deletedContratista);

routerContts.get("/", getAllContratistas);
routerContts.get("/:id", getContratistaById);
routerContts.post("/", validateSchema(registerContratista), postContratista);

export default routerContts;

