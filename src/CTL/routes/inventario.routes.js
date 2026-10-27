import { Router } from "express";
import {
  crearInventario,
  getInventarios,
  getCatalogoDiligenciamiento,
  eliminarInventario,
} from "../controllers/inventario.controller.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";
import { validateSchema } from "../../Middleware/ValidatorSchema.js";
import { registrarInventarioSchema } from "../schemas/inventario.schema.js";

const router = Router();

router.get("/catalogo", checkPermission("inventario", "read"), getCatalogoDiligenciamiento);
router.get("/", checkPermission("inventario", "read"), getInventarios);
router.post("/", checkPermission("inventario", "write"), validateSchema(registrarInventarioSchema), crearInventario);
router.delete("/:id", checkPermission("inventario", "delete"), eliminarInventario);

export default router;
