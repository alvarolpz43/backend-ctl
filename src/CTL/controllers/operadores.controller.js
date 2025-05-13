import { updateOperador, findAllOperadores, insertOperador, deleteOperador, insertOperadorMasivo } from "../services/operadores.service.js";


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

export const createOperadoresMasivo = async (req, res) => {
    const operadores = req.body;

    try {
        const response = await insertOperadorMasivo(operadores);

        if (!response.success) {
            return res
                .status(400)
                .setHeader("X-Error-Message", response.message)
                .json(response);
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error en createOperadoresMasivo:", error);
        res
            .status(500)
            .setHeader("X-Error-Message", error.message || "Error inesperado")
            .json({
                message: "Error al hacer insert masivo de operadores",
                error: error.message
            });
    }
};


export const editOperador = async (req, res) => {
    try {
        const response = await updateOperador(req.params.id, req.body);
        res.status(response.statusCode || 500).json(response);
    } catch (error) {
        console.error("Error en editOperador:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            statusCode: 500
        });
    }
};
export const deletedOperador = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteOperador(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deletedOperador",
            error
        })
    }
}