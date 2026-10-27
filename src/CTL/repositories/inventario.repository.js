import InventarioModel from "../models/inventario.model.js";
import "../models/zonas.model.js";
import "../models/contratistas.model.js";
import "../models/fincas.model.js";
import "../models/equipos.model.js";
import "../../Auth/models/user.model.js";

const insertMany = async (records) => {
  return await InventarioModel.insertMany(records);
};

const findAll = async (query = {}, { page = 1, limit = 50, sort = { fecha: -1, createdAt: -1 } } = {}) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    InventarioModel.find(query)
      .populate("zonaId", "_id nombreZona codeZona")
      .populate("contratistaId", "_id nombre estado")
      .populate("fincaId", "_id nombreFinca codeFinca nucleoId")
      .populate("equipoId", "_id nombreEquipo serieEquipo tipoEquipo contratistaId")
      .populate("usuarioId", "_id name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    InventarioModel.countDocuments(query),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
};

const findById = async (id) => {
  return await InventarioModel.findById(id)
    .populate("zonaId", "_id nombreZona codeZona")
    .populate("contratistaId", "_id nombre estado")
    .populate("fincaId", "_id nombreFinca codeFinca nucleoId")
    .populate("equipoId", "_id nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("usuarioId", "_id name email");
};

const updateById = async (id, updateData) => {
  return await InventarioModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  )
    .populate("zonaId", "_id nombreZona codeZona")
    .populate("contratistaId", "_id nombre estado")
    .populate("fincaId", "_id nombreFinca codeFinca nucleoId")
    .populate("equipoId", "_id nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("usuarioId", "_id name email");
};

const deleteById = async (id) => {
  return await InventarioModel.findByIdAndDelete(id);
};

const deleteByGrupo = async (grupoEnvioId) => {
  return await InventarioModel.deleteMany({ grupoEnvioId });
};

const getTotales = async (query = {}) => {
  const result = await InventarioModel.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalCampo: { $sum: "$invCampo" },
        totalTransito: { $sum: "$invTransito" },
        totalViaFinca: { $sum: "$invViaFinca" },
        granTotal: { $sum: "$totalInventario" },
        conteo: { $sum: 1 },
      },
    },
  ]);

  if (!result || result.length === 0) {
    return {
      totalCampo: 0,
      totalTransito: 0,
      totalViaFinca: 0,
      granTotal: 0,
      conteo: 0,
    };
  }

  const { _id, ...totales } = result[0];
  return totales;
};

export default {
  insertMany,
  findAll,
  findById,
  updateById,
  deleteById,
  deleteByGrupo,
  getTotales,
};
