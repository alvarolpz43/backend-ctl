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

    const { nombreEquipo, serieEquipo } = data;

    const equipoExist = await equipoRepository.findEquipoByName(nombreEquipo);

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

    const { nombre, ...demasData } = data;

    let contratistaUpdate = { ...demasData };

    if (nombre) {
        const contraExist = await contratistaRepository.findContratistaByName(nombre);

        if (contraExist) {
            return {
                success: false,
                message: "La contratista ya existe"
            };
        };
    };

    const response = await contratistaRepository.updateContratista(
        id,
        contratistaUpdate
    );

    if (!response) {
        return {
            success: false,
            message: "Contratista no encontrada"
        }
    }

    return {
        success: true,
        message: "Contratista Actualizada"
    }

}

