import PreguntaBancoModel from "../models/preguntasBanco.model.js";

export const findAllPreguntasBanco = async (query = {}) => {
    return await PreguntaBancoModel.find(query).sort({ categoria: 1, label: 1 });
};

export const findPreguntaBancoById = async (id) => {
    return await PreguntaBancoModel.findById(id);
};

export const findPreguntaBancoByLabel = async (label) => {
    return await PreguntaBancoModel.findOne({ label });
};

export const savePreguntaBanco = async (data) => {
    const nueva = new PreguntaBancoModel(data);
    return await nueva.save();
};

export const modifyPreguntaBanco = async (id, data) => {
    return await PreguntaBancoModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const removePreguntaBanco = async (id) => {
    return await PreguntaBancoModel.findByIdAndDelete(id);
};

export const countPreguntasBanco = async () => {
    return await PreguntaBancoModel.countDocuments();
};
