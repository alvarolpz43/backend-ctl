import { findAllEquipos, insertEquipos, updateEquipo } from "../services/equipo.service.js";

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

    const { body, params } = req;

    try {

        const response = await updateEquipo(params.id, body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in editEquipo",
            error
        });
    };
};