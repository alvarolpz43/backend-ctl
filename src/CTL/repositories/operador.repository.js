import operadorModel from "../models/operador.model.js";

const findOperadorById = async (id) => {
    return await operadorModel.findById(id);
}


const findAllOperadores = async () => {
    return await operadorModel.find();
}

const insertOperador = async (data) => {
    const newOperador = new operadorModel(data);
    return newOperador.save();
}

const updateOperador = async (id, data) => {
    return await operadorModel.updateOne({ _id: id }, data);
};

const findOperadorByCc = async (cc) => {
    return await operadorModel.findOne({ numCedula: cc });
}

export default {
    findAllOperadores,
    findOperadorByCc,
    findOperadorById,
    insertOperador,
    updateOperador
};