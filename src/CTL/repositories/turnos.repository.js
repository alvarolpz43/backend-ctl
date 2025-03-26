import turnosModel from "../models/turnos.model.js";

const findTurnoById = async (id) => {
    return await turnosModel.findById(id);
}


const findAllTurnos = async () => {
    return await turnosModel.find();
}

const insertTurno = async (data) => {
    const newTurno = new turnosModel(data);
    return newTurno.save();
}

const updateTurno = async (id, data) => {
    return await turnosModel.updateOne({ _id: id }, data);
};

const findTurnoByName = async (name) => {
    return await turnosModel.findOne({ nombreTurno: name });
}

export default {
    findAllTurnos,
    findTurnoByName,
    findTurnoById,
    insertTurno,
    updateTurno
};

