import { Router } from "express";
import {
  getAllListas,
  getListaById,
  createLista,
  editLista,
  duplicateLista,
  toggleActivoLista,
  deleteLista,
  responderLista,
  getRespuestasByLista,
  getListasByTipoEquipo,
  getListasByEquipoId,
} from "../controllers/listas.controller.js";
import { listaTemplateSchema } from "../schemas/listas.schema.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const routerListas = Router();

routerListas.get("/", checkPermission("listas", "read"), getAllListas);
routerListas.get("/por-tipo/:tipoEquipo", checkPermission("listas", "read"), getListasByTipoEquipo);
routerListas.get("/por-equipo/:equipoId", checkPermission("listas", "read"), getListasByEquipoId);
routerListas.get("/:id", checkPermission("listas", "read"), getListaById);
routerListas.post("/", checkPermission("listas", "write"), validateSchema(listaTemplateSchema), createLista);
routerListas.put("/:id", checkPermission("listas", "update"), editLista);
routerListas.post("/:id/duplicar", checkPermission("listas", "write"), duplicateLista);
routerListas.patch("/:id/toggle-activo", checkPermission("listas", "update"), toggleActivoLista);
routerListas.delete("/:id", checkPermission("listas", "delete"), deleteLista);

// Endpoints para captura y consulta de respuestas en campo
routerListas.post("/:id/responder", checkPermission("listas", "write"), responderLista);
routerListas.post("/:id/respuestas", checkPermission("listas", "write"), responderLista);
routerListas.get("/:id/respuestas", checkPermission("listas", "read"), getRespuestasByLista);

export default routerListas;
