import LineaModel from "../models/lineas.model.js";

const findAll = async (query = {}) => {
  return await LineaModel.find(query)
    .populate("contratistaId", "nombre estado")
    .populate("harvesters", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("forwarders", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("fincasDefault", "nombreFinca codeFinca nucleoId")
    .sort({ createdAt: -1 });
};

const findById = async (id) => {
  return await LineaModel.findById(id)
    .populate("contratistaId", "nombre estado")
    .populate("harvesters", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("forwarders", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("fincasDefault", "nombreFinca codeFinca nucleoId");
};

const findByContratista = async (contratistaId) => {
  return await LineaModel.find({ contratistaId })
    .populate("contratistaId", "nombre estado")
    .populate("harvesters", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("forwarders", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("fincasDefault", "nombreFinca codeFinca nucleoId");
};

const create = async (data) => {
  const newLinea = new LineaModel(data);
  return await newLinea.save();
};

const update = async (id, data) => {
  return await LineaModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate("contratistaId", "nombre estado")
    .populate("harvesters", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("forwarders", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("fincasDefault", "nombreFinca codeFinca nucleoId");
};

const deleteById = async (id) => {
  return await LineaModel.findByIdAndDelete(id);
};

export default {
  findAll,
  findById,
  findByContratista,
  create,
  update,
  deleteById,
};
