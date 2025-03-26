import Router from "express";

import { getAllContratistas, postContratista, editContratista } from "../controllers/contratistas.controller.js";
import {registerContratista} from "../schemas/contratista.schema.js"
import { validateSchema } from "../../Middleware/ValidatorSchema.js";

const routerContts = Router();

routerContts.get("/", getAllContratistas);
routerContts.post("/",validateSchema(registerContratista),postContratista);
routerContts.put("/edit:/id",editContratista);

export default routerContts;

