import { findAllEspecies, insertEspecies, updateEspecie } from "../services/especies.service.js";


export const getAllEspecies = async (req, res) => {

    try {
        const response = await findAllEspecies();
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllEspecies",
            error
        });
    };
};

export const createEspecie = async (req, res) => {

    const { body } = req;
    try {

        const response = await insertEspecies(body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in createEspecie",
            error
        })
    }
}

export const editEspecie = async (req, res) => {

    const { body, params } = req;

    try {

        const response = await updateEspecie(params.id, body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in editEspecie",
            error
        });
    };
};