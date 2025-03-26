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

    const { nombreEspecie, ...demasData } = data;

    let especieUpdate = { ...demasData };

    if (nombreEspecie) {
        const especieExist = await especieRepository.findEspecieByName(nombreEspecie);

        if (especieExist) {
            return {
                success: false,
                message: "La Especie ya existe"
            };
        };
    };

    const response = await especieRepository.updateContratista(
        id,
        especieUpdate
    );

    if (!response) {
        return {
            success: false,
            message: "Especie no encontrada"
        }
    }

    return {
        success: true,
        message: "Especie Actualizada"
    }

}

