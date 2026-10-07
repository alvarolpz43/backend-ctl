import { Router } from "express";
import {
  getAllLineas,
  getLineaById,
  createLinea,
  updateLinea,
  deleteLinea,
} from "../controllers/lineas.controller.js";
import { checkPermission } from "../../Middleware/CheckPermission.js";

const router = Router();

router.get("/", checkPermission("planeacion", "read"), getAllLineas);
router.get("/:id", checkPermission("planeacion", "read"), getLineaById);
router.post("/", checkPermission("planeacion", "write"), createLinea);
router.put("/:id", checkPermission("planeacion", "update"), updateLinea);
router.delete("/:id", checkPermission("planeacion", "delete"), deleteLinea);

export default router;
