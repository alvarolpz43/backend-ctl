import { Router } from "express";
import {
    getAllPreguntasBanco,
    createPreguntaBanco,
    updatePreguntaBanco,
    deletePreguntaBanco
} from "../controllers/preguntasBanco.controller.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerPreguntasBanco = Router();

routerPreguntasBanco.get("/", checkPermission("listas", "read"), getAllPreguntasBanco);
routerPreguntasBanco.post("/", checkPermission("listas", "write"), createPreguntaBanco);
routerPreguntasBanco.put("/:id", checkPermission("listas", "update"), updatePreguntaBanco);
routerPreguntasBanco.delete("/:id", checkPermission("listas", "delete"), deletePreguntaBanco);

export default routerPreguntasBanco;
