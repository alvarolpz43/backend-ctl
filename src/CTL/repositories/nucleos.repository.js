import nucleoModel from "../models/nucleos.model.js";

const findNucleoById = async (id) => {
    return await nucleoModel.findById(id);
}


const findAllNucleos = async () => {
    return await nucleoModel.find();
}

const insertNucleo = async (data) => {
    const newNucleo = new nucleoModel(data);
    return newNucleo.save();
}

const updateNucleo = async (id, data) => {
    return await nucleoModel.updateOne({ _id: id }, data);
};

const findNucleoByName = async (name) => {
    return await nucleoModel.findOne({ nombreZona: name });
}

export default {
    findAllNucleos,
    findNucleoByName,
    findNucleoById,
    insertNucleo,
    updateNucleo
};