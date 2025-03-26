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

    const { nombre } = data;

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