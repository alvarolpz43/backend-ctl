import mongoose from "mongoose";

import equipoRepository from "../repositories/equipo.repository.js";

export const findAllEquipos = async () => {

    const equipos = await equipoRepository.findAllEquipos();

    if (!equipos) {
        return {
            success: false,
            message: "No hay Equipos Registrados"
        };
    }

    return {
        success: true,
        data: equipos
    };

};

export const insertEquipos = async (data) => {

    const { nombreEquipo, serieEquipo, contratistaId } = data;

    const equipoExist = await equipoRepository.findEquipoBySerie(serieEquipo);

    if (equipoExist) {
        return {
            success: false,
            message: "El equipo ya existe"
        }
    }

    const equipoBody = {
        ...data
    }

    await equipoRepository.insertEquipos(equipoBody);

    return {
        success: true,
        message: "Equipo Registrado"
    }

}

export const updateEquipo = async (id, data) => {
    try {
        if (!id) {
            return { success: false, message: "El id del equipo es requerido" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "El id del equipo no es válido" };
        }

        // Verificar si el nombre ya existe en OTRO equipo
        if (data.nombreEquipo) {
            const equipoExistente = await equipoRepository.findEquipoByName(data.nombreEquipo);
            if (equipoExistente && equipoExistente._id.toString() !== id) {
                return { success: false, message: "Ya existe un equipo con ese nombre" };
            }
        }

        const response = await equipoRepository.updateEquipo(id, data);

        if (response.matchedCount === 0) {
            return { success: false, message: "Equipo no encontrado" };
        }

        return {
            success: true,
            message: "Equipo actualizado correctamente",
            updatedFields: Object.keys(data)
        };

    } catch (error) {
        console.error("Error en updateEquipo:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? `Error de validación: ${error.message}`
                : "Error al actualizar equipo"
        };
    }
};


export const deleteEquipo = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id del equipo es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id del equipo no es valido"
            }
        }

    }

    const response = await equipoRepository.deleteEquipo(id);

    if (!response) {
        return {
            success: false,
            message: "Equipo no eliminado"
        }
    }

    return {
        success: true,
        message: "Equipo Eliminado"
    }
}
