import { findAllFincas, insertFincas, updateFinca, deleteFinca } from "../services/fincas.service.js";


export const getAllFincas = async (req, res) => {

    try {
        const response = await findAllFincas();
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllFincas",
            error
        });
    };
};

export const createFinca = async (req, res) => {

    const { body } = req;
    try {

        const response = await insertFincas(body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in createFinca",
            error
        })
    }
}

export const editFinca = async (req, res) => {
    try {
        const response = await updateFinca(req.params.id, req.body);

        // Códigos de estado más específicos
        const statusCode = response.success ? 200 :
            response.message.includes("Ya existe") ? 409 :
                response.message.includes("no encontrada") ? 404 : 400;

        res.status(statusCode).json(response);

    } catch (error) {
        console.error("Error en editFinca:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deletedFinca = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteFinca(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deletedFinca",
            error
        })
    }
}