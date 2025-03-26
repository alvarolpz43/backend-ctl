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

    const { nombreZona, ...demasData } = data;

    let zonaUpdate = { ...demasData };

    if (nombreZona) {
        const zonaExist = await zonasRepository.findZonaByName(nombreZona);

        if (zonaExist) {
            return {
                success: false,
                message: "la zona ya existe"
            };
        };
    };

    const response = await zonasRepository.updateZona(
        id,
        zonaUpdate
    );

    if (!response) {
        return {
            success: false,
            message: "Zona no encontrada"
        }
    }

    return {
        success: true,
        message: "Zona Actualizadal"
    }

}
