import {
    getAllPreguntasBancoService,
    createPreguntaBancoService,
    updatePreguntaBancoService,
    deletePreguntaBancoService
} from "../services/preguntasBanco.service.js";

export const getAllPreguntasBanco = async (req, res) => {
    try {
        const response = await getAllPreguntasBancoService(req.query);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error en getAllPreguntasBanco:", error);
        return res.status(500).json({ success: false, message: "Error al obtener preguntas del banco", error: error.message });
    }
};

export const createPreguntaBanco = async (req, res) => {
    try {
        const response = await createPreguntaBancoService(req.body);
        const statusCode = response.success ? 201 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en createPreguntaBanco:", error);
        return res.status(500).json({ success: false, message: "Error al guardar pregunta en el banco", error: error.message });
    }
};

export const updatePreguntaBanco = async (req, res) => {
    try {
        const response = await updatePreguntaBancoService(req.params.id, req.body);
        const statusCode = response.success ? 200 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en updatePreguntaBanco:", error);
        return res.status(500).json({ success: false, message: "Error al actualizar pregunta en el banco", error: error.message });
    }
};

export const deletePreguntaBanco = async (req, res) => {
    try {
        const response = await deletePreguntaBancoService(req.params.id);
        const statusCode = response.success ? 200 : 400;
        return res.status(statusCode).json(response);
    } catch (error) {
        console.error("Error en deletePreguntaBanco:", error);
        return res.status(500).json({ success: false, message: "Error al eliminar pregunta del banco", error: error.message });
    }
};
