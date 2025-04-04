import turnosModel from "../models/turnos.model.js";

const findTurnoById = async (id) => {
    return await turnosModel.findById(id);
}


const findAllTurnos = async () => {
    return await turnosModel.find().populate('contratista', 'nombre');
}

const insertTurno = async (data) => {
    const newTurno = new turnosModel(data);
    return newTurno.save();
}

const updateTurno = async (id, data) => {
    return await turnosModel.updateOne(
        { _id: id },
        { $set: data }, // Actualización parcial
        { 
            runValidators: true, // Valida contra el schema
            context: 'query' // Necesario para validar updates
        }
    );
};

const findTurnoByName = async (name) => {
    return await turnosModel.findOne({ nombreTurno: name });
}

const deletedTurno = async (id) => {
    return await turnosModel.deleteOne({ _id: id });
};

export default {
    findAllTurnos,
    findTurnoByName,
    findTurnoById,
    insertTurno,
    updateTurno,
    deletedTurno
};

