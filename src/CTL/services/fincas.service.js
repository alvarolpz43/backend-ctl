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

        // Verificar si el nombre existe en otra finca
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
