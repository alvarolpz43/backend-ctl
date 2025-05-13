import mongoose from "mongoose";
import turnosRepository from "../repositories/turnos.repository.js";



export const findAllTurnos = async () => {

    const turnos = await turnosRepository.findAllTurnos();

    if (!turnos) {
        return {
            success: false,
            message: "No hay turnos registrados"
        }
    }

    return {
        success: true,
        data: turnos
    };
};

export const insertTurno = async (data) => {

    try {
        const { nombreTurno, horaInicio, horaFin, contratistaId } = data;

        const turnoExist = await turnosRepository.findTurnoByNombreYContratista(nombreTurno, contratistaId);


        if (turnoExist) {
            const error = new Error("El turno ya existe en esta contratista");
            error.statusCode = 400;
            throw error;
        }

        const turnoBody = {
            ...data
        }

        await turnosRepository.insertTurno(turnoBody);

        return {
            success: true,
            message: "Turno Registrado"
        }
    } catch (error) {
        console.error("Error en createTurno:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? `Error de validación: ${error.message}`
                : "Error al crear turno",
            statusCode: error.message.includes("validation") ? 400 : 500,
            errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
        };
    }



}

export const updateTurno = async (id, data) => {
    try {
        if (!id) {
            return { success: false, message: "El id del turno es requerido", statusCode: 400 };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "ID de turno no válido", statusCode: 400 };
        }

        if (data.nombreTurno) {
            const turnoExistente = await turnosRepository.findTurnoByName(data.nombreTurno);
            if (turnoExistente && turnoExistente._id.toString() !== id) {
                return {
                    success: false,
                    message: "Ya existe un turno con ese nombre",
                    conflictId: turnoExistente._id,
                    statusCode: 409
                };
            }
        }

        const response = await turnosRepository.updateTurno(id, data);

        if (response.matchedCount === 0) {
            return { success: false, message: "Turno no encontrado", statusCode: 404 };
        }

        return {
            success: true,
            message: "Turno actualizado correctamente",
            modifiedCount: response.modifiedCount,
            updatedFields: Object.keys(data),
            statusCode: 200
        };

    } catch (error) {
        console.error("Error en updateTurno:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? `Error de validación: ${error.message}`
                : "Error al actualizar turno",
            statusCode: error.message.includes("validation") ? 400 : 500,
            errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
        };
    }
};


export const deleteTurno = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id del turno es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id del turno no es valido"
            }
        }

    }

    const response = await turnosRepository.deletedTurno(id);

    if (!response) {
        return {
            success: false,
            message: "Turno no eliminado"
        }
    }

    return {
        success: true,
        message: "Turno eliminado"
    }
}

