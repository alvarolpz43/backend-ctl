import {
  getAllLineas as getAllLineasService,
  getLineaById as getLineaByIdService,
  createLinea as createLineaService,
  updateLinea as updateLineaService,
  deleteLinea as deleteLineaService,
} from "../services/lineas.service.js";

export const getAllLineas = async (req, res) => {
  try {
    const result = await getAllLineasService(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLineaById = async (req, res) => {
  try {
    const result = await getLineaByIdService(req.params.id);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createLinea = async (req, res) => {
  try {
    const result = await createLineaService(req.body);
    return res.status(result.status || 201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLinea = async (req, res) => {
  try {
    const result = await updateLineaService(req.params.id, req.body);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLinea = async (req, res) => {
  try {
    const result = await deleteLineaService(req.params.id);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
