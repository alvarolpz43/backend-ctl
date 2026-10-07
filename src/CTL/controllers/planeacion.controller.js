import {
  getPlaneacionPorPeriodo as getPlaneacionPorPeriodoService,
  upsertPlaneacion as upsertPlaneacionService,
  getAllPlaneaciones as getAllPlaneacionesService,
  deletePlaneacion as deletePlaneacionService,
} from "../services/planeacion.service.js";

export const getPlaneacionPorPeriodo = async (req, res) => {
  try {
    const { anio, mes } = req.params;
    const result = await getPlaneacionPorPeriodoService(anio, mes);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertPlaneacion = async (req, res) => {
  try {
    const result = await upsertPlaneacionService(req.body);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPlaneaciones = async (req, res) => {
  try {
    const result = await getAllPlaneacionesService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlaneacion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePlaneacionService(id);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
