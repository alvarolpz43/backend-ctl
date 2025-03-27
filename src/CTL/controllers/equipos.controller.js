import { findAllEquipos, insertEquipos, updateEquipo, deleteEquipo } from "../services/equipo.service.js";

export const getAllEquipos = async (req, res) => {

    try {
        const response = await findAllEquipos();
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllEquipos",
            error
        });
    };
};

export const createEquipo = async (req, res) => {

    const { body } = req;
    try {

        const response = await insertEquipos(body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in createEquipo",
            error
        })
    }
}

export const editEquipo = async (req, res) => {
    try {
        const response = await updateEquipo(req.params.id, req.body);

        const statusCode = response.success ? 200 : 400;
        res.status(statusCode).json(response);

    } catch (error) {
        console.error("Error en editEquipo:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deletedEquipo = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteEquipo(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deleteEquipo",
            error
        })
    }
}