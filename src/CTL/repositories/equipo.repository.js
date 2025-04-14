import equiposModel from "../models/equipos.model.js";

const findEquiposById = async (id) => {
    return await equiposModel.findById(id);
}


const findAllEquipos = async () => {
    return await equiposModel.find();
}

const insertEquipos = async (data) => {
    const newEquipo = new equiposModel(data);
    return newEquipo.save();
}

const updateEquipo = async (id, data) => {
    return await equiposModel.updateOne(
        { _id: id },
        { $set: data }, // Usar $set para actualización parcial
        { runValidators: true } // Aplicar validaciones del schema
    );
};

const findEquipoByName = async (name) => {
    return await equiposModel.findOne({ nombreEquipo: name });
}
const findEquipoBySerie = async (serie) => {
    return await equiposModel.findOne({ serieEquipo: serie })
}


const deleteEquipo = async (id) => {
    return await equiposModel.deleteOne({ _id: id });
};

export default {
    findAllEquipos,
    findEquipoByName,
    findEquiposById,
    insertEquipos,
    updateEquipo,
    deleteEquipo,
    findEquipoBySerie
};