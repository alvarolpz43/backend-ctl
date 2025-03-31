import operadoresRepository from "../repositories/operador.repository.js";


export const findAllOperadores = async () => {

    const operadores = await operadoresRepository.findAllOperadores();

    if (!operadores) {
        return {
            success: false,
            message: "No hay operadores registrados"
        }
    }

    return {
        success: true,
        data: operadores
    };
};

export const insertOperador = async (data) => {

    const { numCedula, nameOperador, equipoId } = data;

    const operadorExist = await operadoresRepository.findOperadorByCc(numCedula);

    if (operadorExist) {
        return {
            success: false,
            message: "el operador ya existe"
        }
    }

    const operadorBody = {
        ...data
    }

    await operadoresRepository.insertOperador(operadorBody);

    return {
        success: true,
        message: "Operador Registrada"
    }

}

export const updateOperador = async (id, data) => {
    try {
        // Validaciones básicas
        if (!id) {
            return { success: false, message: "El id del operador es requerido", statusCode: 400 };
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "ID de operador no válido", statusCode: 400 };
        }

        // Verificar cédula duplicada en otros registros
        if (data.numCedula) {
            const operadorExistente = await operadoresRepository.findOperadorByCc(data.numCedula);
            if (operadorExistente && operadorExistente._id.toString() !== id) {
                return { 
                    success: false, 
                    message: "Ya existe un operador con esta cédula",
                    conflictId: operadorExistente._id,
                    statusCode: 409
                };
            }
        }

        // Actualización segura
        const response = await operadoresRepository.updateOperador(id, data);

        if (response.matchedCount === 0) {
            return { success: false, message: "Operador no encontrado", statusCode: 404 };
        }

        return {
            success: true,
            message: "Operador actualizado correctamente",
            modifiedCount: response.modifiedCount,
            updatedFields: Object.keys(data),
            statusCode: 200
        };

    } catch (error) {
        console.error("Error en updateOperador:", error);
        return {
            success: false,
            message: error.message.includes("validation") 
                   ? `Error de validación: ${error.message}`
                   : "Error al actualizar operador",
            statusCode: error.message.includes("validation") ? 400 : 500,
            errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
        };
    }
};


export const deleteOperador = async (id) => {

    if (!id) {
        if (!id) {
            return {
                success: false,
                message: "El id del operador es requerido"
            }
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                success: false,
                message: "El id del operador no es valido"
            }
        }

    }

    const response = await operadoresRepository.deletedOperador(id);

    if (!response) {
        return {
            success: false,
            message: "Operador no eliminado"
        }
    }

    return {
        success: true,
        message: "Operador eliminado"
    }
}
