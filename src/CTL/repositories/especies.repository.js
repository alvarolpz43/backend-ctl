import especiesModel from "../models/especies.model.js";

const findEspeciesById = async (id) => {
    return await especiesModel.findById(id);
}


const findAllEspecies = async () => {
    return await especiesModel.find();
}

const insertEspecies = async (data) => {
    const newEspecie = new especiesModel(data);
    return newEspecie.save();
}

const updateEspecie = async (id, data) => {
    return await especiesModel.updateOne(
        { _id: id },
        { $set: data }, // Actualización parcial segura
        { runValidators: true } // Aplica validaciones del schema
    );
};
const findEspecieByName = async (name) => {
    return await especiesModel.findOne({ nombreEspecie: name });
}

const deleteEspecie = async (id) => {
    return await especiesModel.deleteOne({ _id: id });
};


export default {
    findAllEspecies,
    findEspecieByName,
    findEspeciesById,
    insertEspecies,
    updateEspecie,
    deleteEspecie
};