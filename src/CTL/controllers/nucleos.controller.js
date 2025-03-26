import { findAllNucleos, insertNucleos, updateNucleo } from "../services/nucleo.service.js";


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

    const { body, params } = req;

    try {

        const response = await updateNucleo(params.id, body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in editNucleo",
            error
        });
    };
};