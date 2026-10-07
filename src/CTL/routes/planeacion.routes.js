import { Router } from "express";
import {
  getPlaneacionPorPeriodo,
  upsertPlaneacion,
  getAllPlaneaciones,
  deletePlaneacion,
} from "../controllers/planeacion.controller.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const router = Router();

router.get("/periodo/:anio/:mes", checkPermission("planeacion", "read"), getPlaneacionPorPeriodo);
router.post("/", checkPermission("planeacion", "write"), upsertPlaneacion);
router.get("/", checkPermission("planeacion", "read"), getAllPlaneaciones);
router.delete("/:id", checkPermission("planeacion", "delete"), deletePlaneacion);

export default router;
