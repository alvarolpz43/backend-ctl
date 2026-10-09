import ListaTemplateModel from "../models/listas.model.js";
import RespuestaListaModel from "../models/respuestasLista.model.js";
import "../models/equipos.model.js";
import "../models/operador.model.js";
import "../../Auth/models/user.model.js";

export const findAllListas = async (query = {}) => {
    return await ListaTemplateModel.find(query).sort({ createdAt: -1 });
};

export const findListaById = async (id) => {
    return await ListaTemplateModel.findById(id);
};

export const findListaByNombre = async (titulo) => {
    return await ListaTemplateModel.findOne({
        $or: [{ titulo }, { nombre: titulo }]
    });
};

export const findListasByTipoEquipo = async (tipoEquipo) => {
    const tipos = [tipoEquipo];
    if (tipoEquipo !== "General") tipos.push("General");
    if (tipoEquipo !== "Ambos") tipos.push("Ambos");
    return await ListaTemplateModel.find({
        tipoEquipo: { $in: tipos },
        activo: true
    }).sort({ createdAt: -1 });
};

export const saveLista = async (data) => {
    const nuevaLista = new ListaTemplateModel(data);
    return await nuevaLista.save();
};

export const modifyLista = async (id, data) => {
    return await ListaTemplateModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const removeLista = async (id) => {
    return await ListaTemplateModel.findByIdAndDelete(id);
};

export const saveRespuesta = async (data) => {
    const nuevaRespuesta = new RespuestaListaModel(data);
    return await nuevaRespuesta.save();
};

export const findRespuestasByListaId = async (formularioId) => {
    return await RespuestaListaModel.find({
        $or: [{ formularioId }, { listaTemplateId: formularioId }]
    })
        .populate("formularioId", "titulo nombre tipoEquipo version")
        .populate("operadorId", "nameOperador nombreOperador cedula numCedula")
        .populate("equipoId", "nombreEquipo serieEquipo tipoEquipo")
        .populate("usuarioRegistroId", "name email")
        .sort({ fecha: -1, createdAt: -1 });
};

export const findAllRespuestas = async (query = {}) => {
    return await RespuestaListaModel.find(query)
        .populate("formularioId", "titulo nombre tipoEquipo version")
        .populate("operadorId", "nameOperador nombreOperador cedula numCedula")
        .populate("equipoId", "nombreEquipo serieEquipo tipoEquipo")
        .populate("usuarioRegistroId", "name email")
        .sort({ fecha: -1, createdAt: -1 });
};

export const countRespuestasByListaId = async (formularioId) => {
    return await RespuestaListaModel.countDocuments({
        $or: [{ formularioId }, { listaTemplateId: formularioId }]
    });
};

export const countAllRespuestas = async () => {
    return await RespuestaListaModel.countDocuments();
};

export const deleteRespuestaById = async (id) => {
    return await RespuestaListaModel.findByIdAndDelete(id);
};
