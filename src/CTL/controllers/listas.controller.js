import {
    getAllListasService,
    getListaByIdService,
    createListaService,
    updateListaService,
    duplicateListaService,
    toggleActivoListaService,
    deleteListaService,
    registrarRespuestaService,
    getRespuestasByListaService,
    getListasByTipoEquipoService,
    getListasByEquipoIdService
} from "../services/listas.service.js";

export const getAllListas = async (req, res) => {
    try {
        const response = await getAllListasService(req.query);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error en getAllListas:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener listas",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const getListaById = async (req, res) => {
    try {
        const response = await getListaByIdService(req.params.id);
        const statusCode = response.success ? 200 : 404;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en getListaById:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener lista por ID",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const createLista = async (req, res) => {
    try {
        const response = await createListaService(req.body);
        const statusCode = response.success ? 201 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en createLista:", error);
        return res.status(500).json({
            success: false,
            message: "Error al crear lista",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const editLista = async (req, res) => {
    try {
        const response = await updateListaService(req.params.id, req.body);
        const statusCode = response.success ? 200 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en editLista:", error);
        return res.status(500).json({
            success: false,
            message: "Error al actualizar lista",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const duplicateLista = async (req, res) => {
    try {
        const response = await duplicateListaService(req.params.id);
        const statusCode = response.success ? 201 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en duplicateLista:", error);
        return res.status(500).json({
            success: false,
            message: "Error al duplicar lista",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const toggleActivoLista = async (req, res) => {
    try {
        const response = await toggleActivoListaService(req.params.id);
        const statusCode = response.success ? 200 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en toggleActivoLista:", error);
        return res.status(500).json({
            success: false,
            message: "Error al cambiar estado de la lista",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const deleteLista = async (req, res) => {
    try {
        const response = await deleteListaService(req.params.id);
        const statusCode = response.success ? 200 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en deleteLista:", error);
        return res.status(500).json({
            success: false,
            message: "Error al eliminar lista",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const responderLista = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            formularioId: req.params.id || req.body.formularioId || req.body.listaTemplateId,
            listaTemplateId: req.params.id || req.body.listaTemplateId || req.body.formularioId
        };
        const response = await registrarRespuestaService(payload, req.user);
        const statusCode = response.success ? 201 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en responderLista:", error);
        return res.status(500).json({
            success: false,
            message: "Error al registrar respuesta de la lista",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const getRespuestasByLista = async (req, res) => {
    try {
        const response = await getRespuestasByListaService(req.params.id);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error en getRespuestasByLista:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener respuestas de la lista",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const getListasByTipoEquipo = async (req, res) => {
    try {
        const response = await getListasByTipoEquipoService(req.params.tipoEquipo);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error en getListasByTipoEquipo:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener listas por tipo de equipo",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

export const getListasByEquipoId = async (req, res) => {
    try {
        const response = await getListasByEquipoIdService(req.params.equipoId);
        const statusCode = response.success ? 200 : 404;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en getListasByEquipoId:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener listas para el equipo especificado",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
