import { findAllTurnos, insertTurno, updateTurno, deleteTurno } from "../services/turnos.service.js";


export const getAllTurnos = async (req, res) => {

    try {
        const response = await findAllTurnos();
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllTurnos",
            error
        });
    };
};

export const createTurno = async (req, res) => {

    const { body } = req;
    try {

        const response = await insertTurno(body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in createTurno",
            error
        })
    }
}

export const editTurno = async (req, res) => {
    try {
        const response = await updateTurno(req.params.id, req.body);
        res.status(response.statusCode || 500).json(response);
    } catch (error) {
        console.error("Error en editTurno:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            statusCode: 500
        });
    }
};

export const deletedTurno = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteTurno(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deleteTurno",
            error
        })
    }
}