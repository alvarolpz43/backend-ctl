
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
    return await contratistasModel.updateOne(
        { _id: id },
        { $set: data },
        { runValidators: true } // Asegura que se ejecuten las validaciones del schema
    );
};

const findContratistaByName = async (name) => {
    return await contratistasModel.findOne({ nombre: name });
}
const deleteContratista = async (id) => {
    return await contratistasModel.deleteOne({ _id: id });
};

export default {
    findAllContratistas,
    findContratistaById,
    insertContratista,
    updateContratista,
    findContratistaByName,
    deleteContratista
};