import { findAllContratistas, insertContratista, updateContratista, deleteContratista, findByIdContratista } from "../services/contratista.service.js";


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

export const getContratistaById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                message: "La contratista no existe",
            }
            )
        }

        const response = await findByIdContratista(id);
        return res.status(200).json(response);



    } catch (e) {
        console.log(e);
        res.status(400).json({
            message: "Something went wrong in getByIdContratista",
            e
        })
    }
}

export const postContratista = async (req, res) => {
    const { body } = req;

    try {
        const response = await insertContratista(body);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .setHeader("X-Error-Message", error.message || "Error inesperado")
            .json({
                message: "Error al hacer insert de contratista",
                error: error.message
            });
    }
}

export const editContratista = async (req, res) => {
    try {
        const response = await updateContratista(req.params.id, req.body);

        if (!response.success) {
            return res.status(400).json(response);
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error en editContratista:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deletedContratista = async (req, res) => {
    const { params } = req;
    try {
        const response = await deleteContratista(params.id);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong in deleteContratista",
            error
        })
    }
}

