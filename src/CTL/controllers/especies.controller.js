import { findAllEspecies, insertEspecies, updateEspecie, deleteEspecie } from "../services/especies.service.js";


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
        res
            .status(500)
            .setHeader("X-Error-Message", error.message || "Error inesperado")
            .json({
                message: "Error al hacer insert de especie ",
                error: error.message
            });
    }
}

export const editEspecie = async (req, res) => {
    try {
        const response = await updateEspecie(req.params.id, req.body);

        const statusCode = response.success ? 200 : 400;
        res.status(statusCode).json(response);

    } catch (error) {
        console.error("Error en editEspecie:", error);
        res.status(500).setHeader("X-Error-Message", error.message || "Error inesperado")
            .json({
                success: false,
                message: "Error interno del servidor",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
    }
};

export const deletedEspecie = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteEspecie(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deletedEspecie",
            error
        })
    }
}