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
    return await zonaModel.updateOne({ _id: id }, data);
};

const findZonaByName = async (name) => {
    return await zonaModel.findOne({ nombreZona: name });
}

export default {
    findAllZonas,
    findZonaByName,
    findZonaById,
    insertZona,
    updateZona
};