import operadorModel from "../models/operador.model.js";

const findOperadorById = async (id) => {
    return await operadorModel.findById(id);
}


const findAllOperadores = async () => {
    return await operadorModel.find()
        .populate({
            path: 'equipoId',  
            populate: {
                path: 'contratistaId',  
                model: 'contratistas'  
            }
        });
}

const insertOperador = async (data) => {
    const newOperador = new operadorModel(data);
    return newOperador.save();
}

const updateOperador = async (id, data) => {
    return await operadorModel.updateOne(
        { _id: id },
        { $set: data }, // Actualización parcial
        { 
            runValidators: true, // Valida contra el schema
            context: 'query' // Necesario para validar updates
        }
    );
};

const findOperadorByCc = async (cc) => {
    return await operadorModel.findOne({ numCedula: cc });
}


const deletedOperador = async (id) => {
    return await operadorModel.deleteOne({ _id: id });
};


export default {
    findAllOperadores,
    findOperadorByCc,
    findOperadorById,
    insertOperador,
    updateOperador,
    deletedOperador
};