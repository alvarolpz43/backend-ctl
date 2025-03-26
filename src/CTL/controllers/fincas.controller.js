import { findAllFincas, insertFincas, updateFinca } from "../services/fincas.service.js";


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

    const { body, params } = req;

    try {

        const response = await updateFinca(params.id, body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in editFinca",
            error
        });
    };
};