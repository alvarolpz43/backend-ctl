import PlaneacionModel from "../models/planeacion.model.js";

const findAll = async (query = {}) => {
  return await PlaneacionModel.find(query)
    .populate("lineasConfig.lineaId", "nombre contratistaId harvesters forwarders fincasDefault metaMinimaDefecto")
    .populate("lineasConfig.contratistaId", "nombre estado")
    .populate("lineasConfig.harvesters", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.forwarders", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.fincas", "nombreFinca codeFinca nucleoId")
    .sort({ anio: -1, mes: -1 });
};

const findById = async (id) => {
  return await PlaneacionModel.findById(id)
    .populate("lineasConfig.lineaId", "nombre contratistaId harvesters forwarders fincasDefault metaMinimaDefecto")
    .populate("lineasConfig.contratistaId", "nombre estado")
    .populate("lineasConfig.harvesters", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.forwarders", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.fincas", "nombreFinca codeFinca nucleoId");
};

const findByPeriodo = async (periodo) => {
  return await PlaneacionModel.findOne({ periodo })
    .populate("lineasConfig.lineaId", "nombre contratistaId harvesters forwarders fincasDefault metaMinimaDefecto")
    .populate("lineasConfig.contratistaId", "nombre estado")
    .populate("lineasConfig.harvesters", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.forwarders", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.fincas", "nombreFinca codeFinca nucleoId");
};

const findByAnioMes = async (anio, mes) => {
  const anioNum = Number(anio);
  const mesNum = Number(mes);
  const periodo = `${anioNum}-${String(mesNum).padStart(2, "0")}`;
  return await findByPeriodo(periodo);
};

const create = async (data) => {
  const newPlan = new PlaneacionModel(data);
  return await newPlan.save();
};

const update = async (id, data) => {
  return await PlaneacionModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate("lineasConfig.lineaId", "nombre contratistaId harvesters forwarders fincasDefault metaMinimaDefecto")
    .populate("lineasConfig.contratistaId", "nombre estado")
    .populate("lineasConfig.harvesters", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.forwarders", "nombreEquipo serieEquipo tipoEquipo")
    .populate("lineasConfig.fincas", "nombreFinca codeFinca nucleoId");
};

const deleteById = async (id) => {
  return await PlaneacionModel.findByIdAndDelete(id);
};

export default {
  findAll,
  findById,
  findByPeriodo,
  findByAnioMes,
  create,
  update,
  deleteById,
};
