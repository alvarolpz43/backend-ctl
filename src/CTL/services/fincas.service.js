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

    const { nombreFinca, ...demasData } = data;

    let fincaUpdate = { ...demasData };

    if (nombreFinca) {
        const fincaExist = await fincasRepository.findFincaByName(nombreFinca);

        if (fincaExist) {
            return {
                success: false,
                message: "La Finca ya existe"
            };
        };
    };

    const response = await fincasRepository.updateFinca(
        id,
        fincaUpdate
    );

    if (!response) {
        return {
            success: false,
            message: "Finca no encontrada"
        }
    }

    return {
        success: true,
        message: "Finca Actualizada"
    }

}
