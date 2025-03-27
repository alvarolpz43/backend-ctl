import nucleosRepository from "../repositories/nucleos.repository.js";


export const findAllNucleos = async () => {

    const nucleos = await nucleosRepository.findAllNucleosL();

    if (!nucleos) {
        return {
            success: false,
            message: "No hay nucleos registradas"
        }
    }

    return {
        success: true,
        data: nucleos
    };
};

export const insertNucleos = async (data) => {

    const { codeNucleo, nombreNucleo, zonaId } = data;

    const nucleoExist = await nucleosRepository.findNucleoByName(nombreNucleo);

    if (nucleoExist) {
        return {
            success: false,
            message: "el nucleo ya existe"
        }
    }
    l
    const nucleoBody = {
        ...data
    }

    await nucleosRepository.insertNucleo(nucleoBody);

    return {
        success: true,
        message: "Nucleo Registrado"
    }

}

export const updateNucleo = async (id, data) => {
    try {
        // Validaciones básicas
        if (!id) {
            return { success: false, message: "El id del núcleo es requerido", statusCode: 400 };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "ID de núcleo no válido", statusCode: 400 };
        }

        // Verificar nombre duplicado en otros registros
        if (data.nombreNucleo) {
            const nucleoExistente = await nucleosRepository.findNucleoByName(data.nombreNucleo);
            if (nucleoExistente && nucleoExistente._id.toString() !== id) {
                return {
                    success: false,
                    message: "Ya existe un núcleo con ese nombre",
                    conflictId: nucleoExistente._id,
                    statusCode: 409
                };
            }
        }

        // Actualización segura
        const response = await nucleosRepository.updateNucleo(id, data);

        if (response.matchedCount === 0) {
            return { success: false, message: "Núcleo no encontrado", statusCode: 404 };
        }

        return {
            success: true,
            message: "Núcleo actualizado correctamente",
            modifiedCount: response.modifiedCount,
            updatedFields: Object.keys(data),
            statusCode: 200
        };

    } catch (error) {
        console.error("Error en updateNucleo:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? `Error de validación: ${error.message}`
                : "Error al actualizar núcleo",
            statusCode: error.message.includes("validation") ? 400 : 500,
            errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
        };
    }
};

export const deleteNucleo = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id del nucleo es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id del nucleo no es valido"
            }
        }

    }

    const response = await nucleosRepository.deletedNucleo(id);

    if (!response) {
        return {
            success: false,
            message: "Nucleo no eliminado"
        }
    }

    return {
        success: true,
        message: "Nucleo eliminado"
    }
}
