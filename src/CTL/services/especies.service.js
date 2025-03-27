import mongoose from "mongoose";

import especieRepository from "../repositories/especies.repository.js";


export const findAllEspecies = async () => {

    const especies = await especieRepository.findAllEspecies();

    if (!especies) {
        return {
            success: false,
            message: "No hay especies registradas"
        }
    }

    return {
        success: true,
        data: especies
    };
};

export const insertEspecies = async (data) => {

    const { nombreEspecie } = data;

    const especieExist = await especieRepository.findEspecieByName(nombreEspecie);

    if (especieExist) {
        return {
            success: false,
            message: "la especie ya existe"
        }
    }

    const especieBody = {
        ...data
    }

    await especieRepository.insertEspecies(especieBody);

    return {
        success: true,
        message: "Especie Registrada"
    }

}

export const updateEspecie = async (id, data) => {
    try {
        if (!id) {
            return { success: false, message: "El id de la especie es requerido" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "El id de la especie no es válido" };
        }

        // Verificar si el nombre existe en otra especie
        if (data.nombreEspecie) {
            const especieExistente = await especieRepository.findEspecieByName(data.nombreEspecie);
            if (especieExistente && especieExistente._id.toString() !== id) {
                return { success: false, message: "Ya existe una especie con ese nombre" };
            }
        }

        const response = await especieRepository.updateEspecie(id, data);

        if (response.matchedCount === 0) {
            return { success: false, message: "Especie no encontrada" };
        }

        return {
            success: true,
            message: "Especie actualizada correctamente",
            modifiedCount: response.modifiedCount
        };

    } catch (error) {
        console.error("Error en updateEspecie:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? "Error de validación: " + error.message
                : "Error al actualizar especie"
        };
    }
};

export const deleteEspecie = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id de la especie es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id de la especie no es valido"
            }
        }

    }

    const response = await especieRepository.deleteEspecie(id);

    if (!response) {
        return {
            success: false,
            message: "Especie no eliminada"
        }
    }

    return {
        success: true,
        message: "Especie eliminada"
    }
}
