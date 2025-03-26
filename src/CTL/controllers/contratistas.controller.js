import { findAllContratistas, insertContratista, updateContratista } from "../services/contratista.service.js";


export const getAllContratistas = async (req, res) => {

    try {
        const response = await findAllContratistas();
        return res.status(200).json(response);
    } catch (error) {

        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllContratistas",
            error
        });

    };


};

export const postContratista = async (req, res) => {
    const { body } = req;

    try {
        const response = await insertContratista(body);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in postContratista",
            error
        });
    };
};

export const editContratista = async (req, res) => {
    const { body, params } = req;

    try {
        const response = await updateContratista(params.id, body);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in postContratista",
            error
        });
    };
};

