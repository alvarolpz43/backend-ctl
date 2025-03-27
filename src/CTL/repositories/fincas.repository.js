import fincaModel from "../models/fincas.model.js";

const findFincaById = async (id) => {
    return await fincaModel.findById(id);
}


const findAllFincas = async () => {
    return await fincaModel.find();
}

const insertFinca = async (data) => {
    const newFinca = new fincaModel(data);
    return newFinca.save();
}

const updateFinca = async (id, data) => {
    return await fincaModel.updateOne(
        { _id: id },
        { $set: data }, // Actualización parcial segura
        { 
            runValidators: true, // Aplica validaciones del schema
            context: 'query' // Necesario para algunas validaciones
        }
    );
};

const findFincaByName = async (name) => {
    return await fincaModel.findOne({ nombreFinca: name }); 
}

const deletedFinca = async (id) => {
    return await fincaModel.deleteOne({ _id: id });
};

export default {
    findAllFincas,
    findFincaByName,
    findFincaById,
    insertFinca,
    updateFinca,
    deletedFinca
};