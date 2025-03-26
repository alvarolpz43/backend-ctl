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

    const { nombreNucleo, ...demasData } = data;

    let nucleoUpdate = { ...demasData };

    if (nombreNucleo) {
        const nucleoExist = await nucleosRepository.findNucleoByName(nombreNucleo);

        if (nucleoExist) {
            return {
                success: false,
                message: "El nucleo ya existe"
            };
        };
    };

    const response = await nucleosRepository.updateNucleo(
        id,
        nucleoUpdate
    );

    if (!response) {
        return {
            success: false,
            message: "Nucleo no encontrado"
        }
    }

    return {
        success: true,
        message: "Nucleo Actualizado"
    }

}
