import { findAllNucleos, insertNucleos, updateNucleo, deleteNucleo } from "../services/nucleo.service.js";


export const getAllNucleos = async (req, res) => {

    try {
        const response = await findAllNucleos();
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllNucleos",
            error
        });
    };
};

export const createNucleo = async (req, res) => {

    const { body } = req;
    try {

        const response = await insertNucleos(body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in createNucleo",
            error
        })
    }
}

export const editNucleo = async (req, res) => {
    try {
        const response = await updateNucleo(req.params.id, req.body);
        res.status(response.statusCode || 500).json(response);
    } catch (error) {
        console.error("Error en editNucleo:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            statusCode: 500
        });
    }
};

export const deletedNucleo = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteNucleo(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deletedNucleo",
            error
        })
    }
}