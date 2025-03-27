import zonasRepository from "../repositories/zonas.repository.js";


export const findAllZonas = async () => {

    const zonas = await zonasRepository.findAllZonas();

    if (!zonas) {
        return {
            success: false,
            message: "No hay zonas registradas"
        }
    }

    return {
        success: true,
        data: zonas
    };
};

export const insertZona = async (data) => {

    const { codeZona, nombreZona } = data;

    const zonaExist = await zonasRepository.findZonaByName(nombreZona);

    if (zonaExist) {
        return {
            success: false,
            message: "la zona ya existe"
        }
    }
    l
    const zonaBody = {
        ...data
    }

    await zonasRepository.insertNucleo(zonaBody);

    return {
        success: true,
        message: "Zona Registrada"
    }

}

export const updateZona = async (id, data) => {
    try {
        // Validaciones básicas
        if (!id) {
            return {
                success: false,
                message: "El ID de la zona es requerido",
                statusCode: 400
            };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "ID de zona no válido",
                statusCode: 400
            };
        }

        // Verificar nombre duplicado en otros registros
        if (data.nombreZona) {
            const zonaExistente = await zonasRepository.findZonaByName(data.nombreZona);
            if (zonaExistente && zonaExistente._id.toString() !== id) {
                return {
                    success: false,
                    message: "Ya existe una zona con ese nombre",
                    conflictId: zonaExistente._id,
                    statusCode: 409
                };
            }
        }

        // Actualización segura con $set
        const response = await zonasRepository.updateZona(id, data);

        if (response.matchedCount === 0) {
            return {
                success: false,
                message: "Zona no encontrada",
                statusCode: 404
            };
        }

        return {
            success: true,
            message: "Zona actualizada correctamente",
            modifiedCount: response.modifiedCount,
            updatedFields: Object.keys(data),
            statusCode: 200
        };

    } catch (error) {
        console.error("Error en updateZona:", error);
        return {
            success: false,
            message: error.message.includes("validation")
                ? `Error de validación: ${error.message}`
                : "Error al actualizar zona",
            statusCode: error.message.includes("validation") ? 400 : 500,
            errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
        };
    }
};


export const deleteZona = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id de la zona es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id de la zona no es valido"
            }
        }

    }

    const response = await zonasRepository.deletedZona(id);

    if (!response) {
        return {
            success: false,
            message: "Zona no eliminada"
        }
    }

    return {
        success: true,
        message: "Zona eliminada"
    }
}
