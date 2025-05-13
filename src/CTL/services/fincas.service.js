import mongoose from "mongoose";
import fincasRepository from "../repositories/fincas.repository.js";


export const findAllFincas = async () => {

    const fincas = await fincasRepository.findAllFincas();

    if (!fincas) {
        return {
            success: false,
            message: "No hay fincas registradas"
        }
    }

    return {
        success: true,
        data: fincas
    };
};

export const insertMasiveFincas = async (dataArray) => {
    try {
        if (!Array.isArray(dataArray)) {
            return {
                success: false,
                message: "Se esperaba un array de fincas",
                errorCode: "INVALID_INPUT_TYPE"
            };
        }

        const invalidFincas = dataArray.filter(item =>
            !item?.nombreFinca || !item?.codeFinca || !item?.nucleoId
        );

        if (invalidFincas.length > 0) {
            console.warn("Fincas con campos faltantes:", invalidFincas);
            return {
                success: false,
                message: "Algunas fincas no tienen los campos requeridos",
                invalidCount: invalidFincas.length,
                requiredFields: ["nombreFinca", "codeFinca", "nucleoId"],
                errorCode: "MISSING_REQUIRED_FIELDS"
            };
        }

        console.log("Total fincas a insertar:", dataArray.length);

        const result = await fincasRepository.insertMultipleFincas(dataArray);

        return {
            success: true,
            message: `${result.insertedCount} fincas insertadas correctamente`,
            insertedCount: result.insertedCount,
            insertedIds: result.insertedIds
        };

    } catch (error) {
        console.error("Error en insertMasiveFincas:", error);

        if (error.name === 'BulkWriteError') {
            const insertedCount = error.result?.nInserted || 0;
            const duplicates = error.writeErrors?.map(err => ({
                index: err.index,
                code: err.code,
                message: err.errmsg
            })) || [];

            console.warn("Fincas no insertadas por duplicados:", duplicates);

            return {
                success: false,
                message: `Inserción parcial (${insertedCount} de ${dataArray.length})`,
                insertedCount,
                duplicates,
                errorCode: "PARTIAL_INSERTION"
            };
        }

        return {
            success: false,
            message: "Error al insertar fincas masivamente",
            error: error.message,
            errorCode: "MASS_INSERT_ERROR"
        };
    }
};


export const insertFincas = async (data) => {

    const { codeFinca, nombreFinca, nucleoId } = data;

    const fincaExist = await fincasRepository.findFincaByName(nombreFinca);

    if (fincaExist) {
        return {
            success: false,
            message: "la finca ya existe"
        }
    }

    const fincaBody = {
        ...data
    }

    await fincasRepository.insertFinca(fincaBody);

    return {
        success: true,
        message: "Finca Registrada"
    }

}

export const updateFinca = async (id, data) => {
    try {
        if (!id) {
            return { success: false, message: "El id de la finca es requerido" };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "El id de la finca no es válido" };
        }

        if (data.nombreFinca) {
            const fincaExistente = await fincasRepository.findFincaByName(data.nombreFinca);
            if (fincaExistente && fincaExistente._id.toString() !== id) {
                return {
                    success: false,
                    message: "Ya existe una finca con ese nombre",
                    conflictId: fincaExistente._id
                };
            }
        }

        const response = await fincasRepository.updateFinca(id, data);

        if (response.matchedCount === 0) {
            return { success: false, message: "Finca no encontrada" };
        }

        return {
            success: true,
            message: "Finca actualizada correctamente",
            updatedFields: Object.keys(data),
            modifiedCount: response.modifiedCount
        };

    } catch (error) {
        console.error("Error en updateFinca:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? `Error de validación: ${error.message}`
                : "Error al actualizar finca",
            errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
};

export const deleteFinca = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id de la finca es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id de la finca no es valido"
            }
        }

    }

    const response = await fincasRepository.deletedFinca(id);

    if (!response) {
        return {
            success: false,
            message: "Finca no eliminada"
        }
    }

    return {
        success: true,
        message: "Finca eliminada"
    }
}
