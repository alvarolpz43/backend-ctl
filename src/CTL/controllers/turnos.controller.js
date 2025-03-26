import { findAllTurnos, insertTurno, updateTurno } from "../services/turnos.service.js";


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

    const { body, params } = req;

    try {

        const response = await updateTurno(params.id, body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in editTurno",
            error
        });
    };
};