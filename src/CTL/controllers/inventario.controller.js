import {
  registrarInventarioMultiProducto,
  listarInventarios,
  obtenerCatalogoFormulario,
  eliminarInventarioService,
} from "../services/inventario.service.js";

export const crearInventario = async (req, res) => {
  try {
    const result = await registrarInventarioMultiProducto(req.body, req.user);
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error en crearInventario:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al registrar inventario",
      error: error.message,
    });
  }
};

export const getInventarios = async (req, res) => {
  try {
    const result = await listarInventarios(req.query, req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en getInventarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al consultar inventarios",
      error: error.message,
    });
  }
};

export const getCatalogoDiligenciamiento = async (req, res) => {
  try {
    const result = await obtenerCatalogoFormulario(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en getCatalogoDiligenciamiento:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener catálogos para el formulario",
      error: error.message,
    });
  }
};

export const eliminarInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await eliminarInventarioService(id);
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en eliminarInventario:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al eliminar inventario",
      error: error.message,
    });
  }
};
