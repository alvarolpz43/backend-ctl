import zonaModel from "../models/zonas.model.js";

const findZonaById = async (id) => {
    return await zonaModel.findById(id);
}


const findAllZonas = async () => {
    return await zonaModel.find();
}

const insertZona = async (data) => {
    const newZona = new zonaModel(data);
    return newZona.save();
}

const updateZona = async (id, data) => {
    return await zonaModel.updateOne(
        { _id: id },
        { $set: data }, // Actualización parcial segura
        {
            runValidators: true, // Valida contra el schema
            context: 'query' // Necesario para validaciones en updates
        }
    );
};

const findZonaByName = async (name) => {
    return await zonaModel.findOne({ nombreZona: name });
}

const deletedZona = async (id) => {
    return await zonaModel.deleteOne({ _id: id });
};

export default {
    findAllZonas,
    findZonaByName,
    findZonaById,
    insertZona,
    updateZona,
    deletedZona
};