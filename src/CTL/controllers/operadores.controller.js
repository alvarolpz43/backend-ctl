import { updateOperador, findAllOperadores, insertOperador } from "../services/operadores.service.js";


export const getAllOperadores = async (req, res) => {

    try {
        const response = await findAllOperadores();
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in getAllOperadores",
            error
        });
    };
};

export const createOperador = async (req, res) => {

    const { body } = req;
    try {

        const response = await insertOperador(body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in createOperador",
            error
        })
    }
}

export const editOperador = async (req, res) => {

    const { body, params } = req;

    try {

        const response = await updateOperador(params.id, body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong in editOperador",
            error
        });
    };
};