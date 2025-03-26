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

    const { numCedula, nameOperador, contratistaId } = data;

    const operadorExist = await operadoresRepository.findOperadorByCc(numCedula);

    if (operadorExist) {
        return {
            success: false,
            message: "el operador ya existe"
        }
    }
    l
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

    const { numCedula, ...demasData } = data;

    let operadorUpdate = { ...demasData };

    if (numCedula) {
        const operadorExist = await operadoresRepository.findOperadorByCc(numCedula);

        if (operadorExist) {
            return {
                success: false,
                message: "el operador ya existe"
            };
        };
    };

    const response = await operadoresRepository.updateZona(
        id,
        operadorUpdate
    );

    if (!response) {
        return {
            success: false,
            message: "Operador no encontrado"
        }
    }

    return {
        success: true,
        message: "Operador Actualizado"
    }

}
