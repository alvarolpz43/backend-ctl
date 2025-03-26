import { findAllZonas, insertZona, updateZona } from "../services/zonas.service.js";


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

    const { body, params } = req;

    try {

        const response = await updateZona(params.id, body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in editZona",
            error
        });
    };
};