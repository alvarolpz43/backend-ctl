import { findAllZonas, insertZona, updateZona, deleteZona } from "../services/zonas.service.js";


export const getAllZonas = async (req, res) => {

    try {
        const response = await findAllZonas();
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllZonas",
            error
        });
    };
};

export const createZona = async (req, res) => {

    const { body } = req;
    try {

        const response = await insertZona(body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in createZona",
            error
        })
    }
}

export const editZona = async (req, res) => {
    try {
        const response = await updateZona(req.params.id, req.body);
        res.status(response.statusCode || 500).json(response);
    } catch (error) {
        console.error("Error en editZona:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            statusCode: 500
        });
    }
};

export const deletedZona = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteZona(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deletedZona",
            error
        })
    }
}