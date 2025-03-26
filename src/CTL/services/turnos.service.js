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

    const { nombreTurno, horaInicio, horaFin } = data;

    const turnoExist = await turnosRepository.findTurnoByName(nombreTurno);

    if (turnoExist) {
        return {
            success: false,
            message: "el turno ya existe"
        }
    }
    l
    const turnoBody = {
        ...data
    }

    await turnosRepository.insertTurno(turnoBody);

    return {
        success: true,
        message: "Turno Registrado"
    }

}

export const updateTurno = async (id, data) => {

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

    const { nombreTurno, ...demasData } = data;

    let turnoUpdate = { ...demasData };

    if (numCedula) {
        const turnoExist = await turnosRepository.findTurnoByName(nombreTurno);

        if (turnoExist) {
            return {
                success: false,
                message: "el turno ya existe"
            };
        };
    };

    const response = await turnosRepository.updateTurno(
        id,
        turnoUpdate
    );

    if (!response) {
        return {
            success: false,
            message: "Turno no encontrado"
        }
    }

    return {
        success: true,
        message: "Turno Actualizado"
    }

}
