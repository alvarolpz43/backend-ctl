
import contratistasModel from "../models/contratistas.model.js";

const findContratistaById = async (id) => {
    return await contratistasModel.findById(id);
}


const findAllContratistas = async () => {
    return await contratistasModel.find();
}

const insertContratista = async (data) => {
    const newContratista = new contratistasModel(data);
    return newContratista.save();
}

const updateContratista = async (id, data) => {
    return await contratistasModel.updateOne({ _id: id }, data);
};

const findContratistaByName = async (name) => {
    return await contratistasModel.findOne({ nombre: name });
}

export default {
    findAllContratistas,
    findContratistaById,
    insertContratista,
    updateContratista,
    findContratistaByName
};