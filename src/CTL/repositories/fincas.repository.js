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
    return await fincaModel.updateOne({ _id: id }, data);
};

const findFincaByName = async (name) => {
    return await fincaModel.findOne({ nombreFinca: name }); 
}

export default {
    findAllFincas,
    findFincaByName,
    findFincaById,
    insertFinca,
    updateFinca
};