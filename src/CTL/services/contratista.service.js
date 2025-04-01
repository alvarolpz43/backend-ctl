import mongoose from "mongoose";
import contratistaRepository from "../repositories/contratista.repository.js"


export const findAllContratistas = async () => {
    const contratistas = await contratistaRepository.findAllContratistas();

    if (!contratistas) {
        return {
            success: false,
            message: "No hay Contratistas Registradas"
        };
    }

    return {
        success: true,
        data: contratistas
    };
};

export const insertContratista = async (data) => {

    const { nombre, estado } = data;

    const contratistaExist = await contratistaRepository.findContratistaByName(nombre);

    if (contratistaExist) {
        return {
            success: false,
            massage: "La contratista ya existe"
        };
    }

    const contratistaBody = {
        ...data
    }

    await contratistaRepository.insertContratista(contratistaBody);

    return {
        success: true,
        message: "Contratista Registrada"
    }

}

export const updateContratista = async (id, data) => {
    try {
        if (!id) {
            return { success: false, message: "El id de la contratista es requerido" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "El id de la contratista no es válido" };
        }


        if (data.nombre) {
            const existente = await contratistaRepository.findContratistaByName(data.nombre);
            if (existente && existente._id.toString() !== id) {
                return { success: false, message: "Ya existe una contratista con ese nombre" };
            }
        }

        const response = await contratistaRepository.updateContratista(id, data);

        if (response.matchedCount === 0) {
            return { success: false, message: "Contratista no encontrada" };
        }

        return {
            success: true,
            message: "Contratista actualizada correctamente",
            data: {
                matchedCount: response.matchedCount,
                modifiedCount: response.modifiedCount
            }
        };

    } catch (error) {
        console.error("Error en updateContratista:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? "Error de validación: " + error.message
                : "Error al actualizar contratista"
        };
    }
};

export const deleteContratista = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id de la contratista es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id de la contratista no es valido"
            }
        }

    }

    const response = await contratistaRepository.deleteContratista(id);

    if (!response) {
        return {
            success: false,
            message: "Contratista no eliminada"
        }
    }

    return {
        success: true,
        message: "Contratista Eliminada"
    }
}