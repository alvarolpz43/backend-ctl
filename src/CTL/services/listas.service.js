import mongoose from "mongoose";
import {
    findAllListas,
    findListaById,
    findListaByNombre,
    saveLista,
    modifyLista,
    removeLista,
    saveRespuesta,
    findRespuestasByListaId,
    findAllRespuestas,
    countRespuestasByListaId,
    countAllRespuestas,
    deleteRespuestaById
} from "../repositories/listas.repository.js";
import equipoRepository from "../repositories/equipo.repository.js";
import { construirJerarquiaArbol } from "./preguntasBanco.service.js";

// Modelos para sincronización por empresa
import ContratistaModel from "../models/contratistas.model.js";
import EquipoModel from "../models/equipos.model.js";
import LineaModel from "../models/lineas.model.js";
import FincaModel from "../models/fincas.model.js";
import NucleoModel from "../models/nucleos.model.js";
import ZonaModel from "../models/zonas.model.js";
import OperadorModel from "../models/operador.model.js";
import TurnoModel from "../models/turnos.model.js";
import EspecieModel from "../models/especies.model.js";
import PreguntasBancoModel from "../models/preguntasBanco.model.js";
import UserModel from "../../Auth/models/user.model.js";
import ListaTemplateModel from "../models/listas.model.js";

const normalizarOpciones = (opciones) => {
    if (!Array.isArray(opciones)) return [];
    return opciones.map(opt => {
        if (!opt) return null;
        if (typeof opt === "string") {
            const trimmed = opt.trim();
            return trimmed ? trimmed : null;
        }
        if (typeof opt === "object") {
            const codigo = opt.codigo !== undefined ? String(opt.codigo).trim() : "";
            const item = opt.item !== undefined ? String(opt.item).trim() : "";
            const categoria = opt.categoria !== undefined ? String(opt.categoria).trim() : "";
            const subcategoria = opt.subcategoria !== undefined ? String(opt.subcategoria).trim() : "";
            const label = opt.label ? String(opt.label).trim() : (codigo && item ? `[${codigo}] ${item}` : item || codigo || "");
            const value = opt.value !== undefined ? String(opt.value).trim() : (codigo || item || label);
            return {
                label,
                value,
                codigo,
                item,
                categoria,
                subcategoria,
                ...opt
            };
        }
        return String(opt);
    }).filter(Boolean);
};

const normalizarTipoCampo = (tipoRaw) => {
    let t = (tipoRaw || "text").toString().toLowerCase().trim();
    if (t === "rating") return "radio";
    if (t === "dropdown") return "select";
    if (t === "multiselect") return "checkbox";
    if (t === "tablareferencia" || t === "tabla_referencia" || t === "tabla") return "tabla_referencia";
    if (t === "array_paradas" || t === "array" || t === "paradas" || t === "parada") return "array_paradas";
    return t;
};

// Normalizador de formulario para garantizar compatibilidad total
const normalizarFormulario = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };

    const titulo = obj.titulo || obj.nombre || "Formulario Operacional";
    const descripcion = obj.descripcion || "";
    const tipoEquipo = obj.tipoEquipo || "General";
    const version = obj.version || 1;
    const activo = obj.activo !== undefined ? obj.activo : true;

    // Normalizar secciones
    const secciones = (obj.secciones || []).map((sec, idx) => ({
        id: sec.id || `sec_${idx + 1}`,
        titulo: sec.titulo || sec.nombre || `Sección ${idx + 1}`,
        descripcion: sec.descripcion || "",
        orden: sec.orden !== undefined ? sec.orden : idx + 1
    }));

    // Normalizar campos (acepta campos o preguntas)
    const rawCampos = obj.campos && obj.campos.length > 0 ? obj.campos : (obj.preguntas || []);
    const campos = rawCampos.map((c, idx) => {
        const opciones = normalizarOpciones(c.opciones);
        const tipo = normalizarTipoCampo(c.tipo || c.tipoCampo);

        const jerarquia = c.jerarquia || (tipo === "cascading_select" || (opciones[0] && typeof opciones[0] === "object") ? construirJerarquiaArbol(opciones) : null);
        const niveles = c.niveles || (jerarquia ? ["Categoría", "Subcategoría", "Ítem / Código"] : []);

        return {
            id: c.id || `campo_${idx + 1}`,
            seccionId: c.seccionId || (secciones[0] ? secciones[0].id : "default"),
            label: c.label || c.texto || `Campo ${idx + 1}`,
            tipo,
            placeholder: c.placeholder || "",
            descripcion: c.descripcion || c.detalle || "",
            required: c.required !== undefined ? Boolean(c.required) : Boolean(c.requerido),
            isDefaultEquipo: Boolean(c.isDefaultEquipo),
            opciones,
            jerarquia,
            niveles,
            limiteMinimo: c.limiteMinimo !== undefined ? c.limiteMinimo : null,
            limiteMaximo: c.limiteMaximo !== undefined ? c.limiteMaximo : null,
            unidadMedida: c.unidadMedida || "",
            tablaReferencia: c.tablaReferencia || null,
            condicion: c.condicion || null,
            orden: c.orden !== undefined ? c.orden : idx + 1
        };
    });

    return {
        _id: obj._id,
        titulo,
        nombre: titulo,
        descripcion,
        tipoEquipo,
        version,
        activo,
        secciones,
        campos,
        preguntas: campos,
        totalCampos: campos.length,
        totalSecciones: secciones.length,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

export const getAllListasService = async (query = {}) => {
    const mongoQuery = {};
    if (query.tipoEquipo && query.tipoEquipo !== "TODOS") {
        if (query.tipoEquipo === "Harvester") {
            mongoQuery.tipoEquipo = { $in: ["Harvester", "Ambos", "General"] };
        } else if (query.tipoEquipo === "Forwarder") {
            mongoQuery.tipoEquipo = { $in: ["Forwarder", "Ambos", "General"] };
        } else if (query.tipoEquipo === "Ambos") {
            mongoQuery.tipoEquipo = { $in: ["Ambos", "General"] };
        } else {
            mongoQuery.tipoEquipo = query.tipoEquipo;
        }
    }
    if (query.activo !== undefined) {
        mongoQuery.activo = query.activo === "true" || query.activo === true;
    }

    const listas = await findAllListas(mongoQuery);
    return {
        success: true,
        data: listas.map(normalizarFormulario)
    };
};

export const getListaByIdService = async (id) => {
    const lista = await findListaById(id);
    if (!lista) {
        return { success: false, message: "Formulario no encontrado" };
    }
    const totalRespuestas = await countRespuestasByListaId(id);
    return {
        success: true,
        data: normalizarFormulario(lista),
        meta: { totalRespuestas }
    };
};

export const createListaService = async (data) => {
    const titulo = (data.titulo || data.nombre || "").trim();
    if (!titulo) {
        return { success: false, message: "El título del formulario es obligatorio" };
    }

    const existe = await findListaByNombre(titulo);
    if (existe) {
        return { success: false, message: `Ya existe un formulario con el título "${titulo}"` };
    }

    const rawCampos = data.campos || data.preguntas || [];
    const camposProcesados = rawCampos.map((c, idx) => {
        const opciones = normalizarOpciones(c.opciones);
        const tipo = normalizarTipoCampo(c.tipo || c.tipoCampo);
        const jerarquia = c.jerarquia || (tipo === "cascading_select" || (opciones[0] && typeof opciones[0] === "object") ? construirJerarquiaArbol(opciones) : null);
        const niveles = c.niveles || (jerarquia ? ["Categoría", "Subcategoría", "Ítem / Código"] : []);

        return {
            id: c.id || `campo_${Date.now().toString(36)}_${idx + 1}`,
            seccionId: c.seccionId || "default",
            label: (c.label || c.texto || "").trim() || `Pregunta ${idx + 1}`,
            tipo,
            placeholder: c.placeholder || "",
            descripcion: c.descripcion || "",
            required: Boolean(c.required !== undefined ? c.required : c.requerido),
            isDefaultEquipo: Boolean(c.isDefaultEquipo),
            opciones,
            jerarquia,
            niveles,
            limiteMinimo: c.limiteMinimo !== undefined ? c.limiteMinimo : null,
            limiteMaximo: c.limiteMaximo !== undefined ? c.limiteMaximo : null,
            unidadMedida: c.unidadMedida || "",
            tablaReferencia: c.tablaReferencia || null,
            orden: c.orden !== undefined ? c.orden : idx + 1
        };
    });

    const seccionesProcesadas = (data.secciones || []).map((sec, idx) => ({
        id: sec.id || `sec_${Date.now().toString(36)}_${idx + 1}`,
        titulo: (sec.titulo || sec.nombre || "").trim() || `Sección ${idx + 1}`,
        descripcion: sec.descripcion || "",
        orden: sec.orden !== undefined ? sec.orden : idx + 1
    }));

    const nuevoFormulario = await saveLista({
        titulo,
        nombre: titulo,
        descripcion: data.descripcion || "",
        tipoEquipo: data.tipoEquipo || "General",
        version: 1,
        activo: data.activo !== undefined ? data.activo : true,
        secciones: seccionesProcesadas,
        campos: camposProcesados,
        preguntas: camposProcesados
    });

    return {
        success: true,
        message: "Formulario creado exitosamente",
        data: normalizarFormulario(nuevoFormulario)
    };
};

export const updateListaService = async (id, data) => {
    const actual = await findListaById(id);
    if (!actual) {
        return { success: false, message: "Formulario no encontrado" };
    }

    const totalRespuestas = await countRespuestasByListaId(id);
    let nuevaVersion = actual.version || 1;
    if (totalRespuestas > 0) {
        nuevaVersion += 1;
    }

    const titulo = (data.titulo || data.nombre || actual.titulo || actual.nombre).trim();
    const rawCampos = data.campos || data.preguntas || actual.campos || [];
    const camposProcesados = rawCampos.map((c, idx) => {
        const opciones = normalizarOpciones(c.opciones);
        const tipo = normalizarTipoCampo(c.tipo || c.tipoCampo);
        const jerarquia = c.jerarquia || (tipo === "cascading_select" || (opciones[0] && typeof opciones[0] === "object") ? construirJerarquiaArbol(opciones) : null);
        const niveles = c.niveles || (jerarquia ? ["Categoría", "Subcategoría", "Ítem / Código"] : []);

        return {
            id: c.id || `campo_${Date.now().toString(36)}_${idx + 1}`,
            seccionId: c.seccionId || "default",
            label: (c.label || c.texto || "").trim() || `Pregunta ${idx + 1}`,
            tipo,
            placeholder: c.placeholder || "",
            descripcion: c.descripcion || "",
            required: Boolean(c.required !== undefined ? c.required : c.requerido),
            isDefaultEquipo: Boolean(c.isDefaultEquipo),
            opciones,
            jerarquia,
            niveles,
            limiteMinimo: c.limiteMinimo !== undefined ? c.limiteMinimo : null,
            limiteMaximo: c.limiteMaximo !== undefined ? c.limiteMaximo : null,
            unidadMedida: c.unidadMedida || "",
            tablaReferencia: c.tablaReferencia || null,
            orden: c.orden !== undefined ? c.orden : idx + 1
        };
    });

    const seccionesProcesadas = (data.secciones || actual.secciones || []).map((sec, idx) => ({
        id: sec.id || `sec_${Date.now().toString(36)}_${idx + 1}`,
        titulo: (sec.titulo || sec.nombre || "").trim() || `Sección ${idx + 1}`,
        descripcion: sec.descripcion || "",
        orden: sec.orden !== undefined ? sec.orden : idx + 1
    }));

    const actualizado = await modifyLista(id, {
        titulo,
        nombre: titulo,
        descripcion: data.descripcion !== undefined ? data.descripcion : actual.descripcion,
        tipoEquipo: data.tipoEquipo || actual.tipoEquipo,
        activo: data.activo !== undefined ? data.activo : actual.activo,
        version: nuevaVersion,
        secciones: seccionesProcesadas,
        campos: camposProcesados,
        preguntas: camposProcesados
    });

    return {
        success: true,
        message: totalRespuestas > 0
            ? `Formulario actualizado a v${nuevaVersion} (respuestas previas preservadas)`
            : "Formulario actualizado exitosamente",
        data: normalizarFormulario(actualizado)
    };
};

export const duplicateListaService = async (id) => {
    const original = await findListaById(id);
    if (!original) {
        return { success: false, message: "Formulario no encontrado" };
    }

    const time = Date.now().toString(36).substr(-4);
    const clonData = original.toObject();
    delete clonData._id;
    delete clonData.createdAt;
    delete clonData.updatedAt;

    clonData.titulo = `${original.titulo || original.nombre} (Copia ${time})`;
    clonData.nombre = clonData.titulo;
    clonData.version = 1;
    clonData.activo = true;

    // Regenerar IDs para evitar colisiones
    if (Array.isArray(clonData.campos)) {
        clonData.campos = clonData.campos.map((c, idx) => ({
            ...c,
            id: `campo_${Date.now().toString(36)}_${idx + 1}`
        }));
    }

    const duplicado = await saveLista(clonData);
    return {
        success: true,
        message: "Formulario duplicado exitosamente",
        data: normalizarFormulario(duplicado)
    };
};

export const toggleActivoListaService = async (id) => {
    const lista = await findListaById(id);
    if (!lista) {
        return { success: false, message: "Formulario no encontrado" };
    }
    const actualizado = await modifyLista(id, { activo: !lista.activo });
    return {
        success: true,
        message: `Formulario ${actualizado.activo ? "activado" : "desactivado"} exitosamente`,
        data: normalizarFormulario(actualizado)
    };
};

export const deleteListaService = async (id) => {
    const lista = await findListaById(id);
    if (!lista) {
        return { success: false, message: "Formulario no encontrado" };
    }

    const totalRespuestas = await countRespuestasByListaId(id);
    if (totalRespuestas > 0) {
        await modifyLista(id, { activo: false });
        return {
            success: true,
            message: "El formulario contiene respuestas registradas. Se ha desactivado para proteger el historial."
        };
    }

    await removeLista(id);
    return {
        success: true,
        message: "Formulario eliminado exitosamente"
    };
};

export const getListasByTipoEquipoService = async (tipoEquipo) => {
    const mongoQuery = {
        activo: true,
        tipoEquipo: { $in: [tipoEquipo, "Ambos", "General"] }
    };
    const formularios = await findAllListas(mongoQuery);
    return {
        success: true,
        tipoEquipo,
        total: formularios.length,
        data: formularios.map(normalizarFormulario)
    };
};

export const getListasByEquipoIdService = async (equipoId) => {
    const equipo = await equipoRepository.findEquiposById(equipoId);
    if (!equipo) {
        return { success: false, message: "Equipo no encontrado" };
    }
    const tipo = equipo.tipoEquipo || "General";
    const mongoQuery = {
        activo: true,
        tipoEquipo: { $in: [tipo, "Ambos", "General"] }
    };
    const formularios = await findAllListas(mongoQuery);
    return {
        success: true,
        equipo: {
            _id: equipo._id,
            nombreEquipo: equipo.nombreEquipo,
            serieEquipo: equipo.serieEquipo,
            tipoEquipo: equipo.tipoEquipo
        },
        data: formularios.map(normalizarFormulario)
    };
};

export const registrarRespuestaService = async (payload, currentUser) => {
    const formId = payload.formularioId || payload.listaTemplateId;
    if (!formId) {
        return { success: false, message: "El ID del formulario es obligatorio" };
    }

    const formulario = await findListaById(formId);
    if (!formulario) {
        return { success: false, message: "El formulario especificado no existe" };
    }

    const formNorm = normalizarFormulario(formulario);
    const camposMap = new Map(formNorm.campos.map(c => [c.id, c]));

    // Normalizar respuestas ya sea array o key-value map
    let respuestasArray = [];
    const respuestasMap = {};

    if (Array.isArray(payload.respuestas)) {
        for (const item of payload.respuestas) {
            const campo = camposMap.get(item.campoId);
            respuestasArray.push({
                campoId: item.campoId,
                label: campo ? campo.label : (item.label || ""),
                tipo: campo ? campo.tipo : (item.tipo || "text"),
                valor: item.valor
            });
            respuestasMap[item.campoId] = item.valor;
        }
    } else if (typeof payload.respuestas === "object" && payload.respuestas !== null) {
        for (const [campoId, valor] of Object.entries(payload.respuestas)) {
            const campo = camposMap.get(campoId);
            respuestasArray.push({
                campoId,
                label: campo ? campo.label : campoId,
                tipo: campo ? campo.tipo : "text",
                valor
            });
            respuestasMap[campoId] = valor;
        }
    }

    // Validar campos requeridos respetando condiciones activas
    const camposFaltantes = [];
    for (const campo of formNorm.campos) {
        if (campo.condicion && campo.condicion.campoId) {
            const condValor = respuestasMap[campo.condicion.campoId];
            const op = campo.condicion.operador || "equals";
            if (op === "equals" && condValor !== campo.condicion.valor) {
                continue;
            }
            if (op === "not_equals" && condValor === campo.condicion.valor) {
                continue;
            }
        }
        if (campo.required) {
            const val = respuestasMap[campo.id];
            if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
                camposFaltantes.push(campo.label);
            }
        }
    }

    if (camposFaltantes.length > 0) {
        return {
            success: false,
            message: `Faltan campos obligatorios: ${camposFaltantes.slice(0, 3).join(", ")}${camposFaltantes.length > 3 ? "..." : ""}`,
            camposFaltantes
        };
    }

    // Resolver equipoId si no viene explícito en payload
    let resolvedEquipoId = payload.equipoId || null;
    if (!resolvedEquipoId) {
        const campoEquipo = formNorm.campos.find(c => c.tipo === "equipo_select" || c.id === "campo_equipo_default" || c.isDefaultEquipo);
        if (campoEquipo && respuestasMap[campoEquipo.id]) {
            resolvedEquipoId = respuestasMap[campoEquipo.id];
        }
    }

    // Extraer producción reportada en m3 para alimentar planeación y KPIs
    const produccionReportada = Number(respuestasMap.m3) || 0;

    // Resolver fincaId
    let resolvedFincaId = payload.fincaId || null;
    if (!resolvedFincaId && respuestasMap.finca && mongoose.Types.ObjectId.isValid(respuestasMap.finca)) {
        resolvedFincaId = respuestasMap.finca;
    }

    // Resolver operadorId
    let resolvedOperadorId = payload.operadorId || null;
    if (!resolvedOperadorId && respuestasMap.operador && mongoose.Types.ObjectId.isValid(respuestasMap.operador)) {
        resolvedOperadorId = respuestasMap.operador;
    }

    // Resolver fecha con hora exacta
    let resolvedFecha = new Date();
    const rawFecha = respuestasMap.fecha || payload.fecha;
    if (rawFecha) {
        const parsed = new Date(rawFecha);
        if (!isNaN(parsed.getTime())) {
            resolvedFecha = parsed;
        }
    }

    const nuevaRespuesta = await saveRespuesta({
        formularioId: formulario._id,
        formularioTituloSnapshot: formNorm.titulo,
        tipoEquipoSnapshot: formNorm.tipoEquipo,
        equipoId: resolvedEquipoId,
        fincaId: resolvedFincaId,
        operadorId: resolvedOperadorId,
        usuarioRegistroId: currentUser ? currentUser._id : null,
        fecha: resolvedFecha,
        produccionToneladas: produccionReportada,
        respuestas: respuestasArray,
        respuestasMap
    });

    return {
        success: true,
        message: "Respuesta del formulario registrada exitosamente",
        data: nuevaRespuesta
    };
};

export const getRespuestasByListaService = async (formularioId) => {
    const respuestas = await findRespuestasByListaId(formularioId);
    return {
        success: true,
        total: respuestas.length,
        data: respuestas
    };
};

export const getAllRespuestasService = async (filters = {}) => {
    const mongoQuery = {};
    if (filters.formularioId) {
        mongoQuery.$or = [{ formularioId: filters.formularioId }, { listaTemplateId: filters.formularioId }];
    }
    if (filters.equipoId) {
        mongoQuery.equipoId = filters.equipoId;
    }
    if (filters.operadorId) {
        mongoQuery.operadorId = filters.operadorId;
    }
    if (filters.tipoEquipo && filters.tipoEquipo !== "Todos") {
        mongoQuery.tipoEquipoSnapshot = filters.tipoEquipo;
    }
    if (filters.fechaDesde || filters.fechaHasta) {
        mongoQuery.fecha = {};
        if (filters.fechaDesde) {
            mongoQuery.fecha.$gte = new Date(filters.fechaDesde);
        }
        if (filters.fechaHasta) {
            const hasta = new Date(filters.fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            mongoQuery.fecha.$lte = hasta;
        }
    }

    const respuestas = await findAllRespuestas(mongoQuery);
    return {
        success: true,
        total: respuestas.length,
        data: respuestas
    };
};

export const deleteRespuestaService = async (id) => {
    const eliminada = await deleteRespuestaById(id);
    if (!eliminada) {
        return { success: false, message: "Reporte de formulario no encontrado" };
    }
    return {
        success: true,
        message: "Reporte diligenciado eliminado exitosamente"
    };
};

/**
 * Paquete atómico de sincronización móvil/cliente basado en la empresa del usuario.
 * Retorna en una sola petición todo lo necesario para operar y diligenciar formularios en campo.
 */
export const getSincronizacionEmpresaService = async (currentUser, requestedContratistaId) => {
    // 1. Determinar el usuario y sus contratistas autorizados
    let userDoc = null;
    if (currentUser?._id) {
        userDoc = await UserModel.findById(currentUser._id).populate("contratistas", "_id nombre estado");
    }

    const todosLosContratistas = currentUser?.todosLosContratistas !== undefined
        ? currentUser.todosLosContratistas
        : (userDoc?.todosLosContratistas ?? true);

    const userContratistas = (currentUser?.contratistas && currentUser.contratistas.length > 0)
        ? currentUser.contratistas
        : (userDoc?.contratistas || []);

    const userContratistasIds = userContratistas.map(c => String(c._id || c));

    let targetContratistaId = null;

    if (requestedContratistaId) {
        // Validar si el usuario tiene acceso a este contratista
        if (!todosLosContratistas && !userContratistasIds.includes(String(requestedContratistaId))) {
            return {
                success: false,
                status: 403,
                message: "Acceso denegado: No tiene permisos asignados para sincronizar los datos de esta empresa/contratista"
            };
        }
        targetContratistaId = requestedContratistaId;
    } else {
        // Seleccionar contratista por defecto
        if (userContratistasIds.length > 0) {
            targetContratistaId = userContratistasIds[0];
        } else {
            // Si es admin sin contratistas fijos, tomar el primer contratista activo
            const primerContratista = await ContratistaModel.findOne({ estado: { $ne: false } });
            targetContratistaId = primerContratista ? primerContratista._id : null;
        }
    }

    if (!targetContratistaId) {
        return {
            success: false,
            status: 404,
            message: "No se encontró ninguna empresa o contratista configurada para sincronizar"
        };
    }

    // 2. Obtener documento de la contratista seleccionada
    const empresaDoc = await ContratistaModel.findById(targetContratistaId);
    if (!empresaDoc) {
        return {
            success: false,
            status: 404,
            message: "La empresa/contratista solicitada no existe en el sistema"
        };
    }

    // 3. Consultas en paralelo para optimizar tiempo de respuesta
    const [
        formulariosRaw,
        lineasRaw,
        equiposRaw,
        turnosRaw,
        especiesRaw,
        todasFincasRaw,
        preguntasBancoRaw
    ] = await Promise.all([
        // Plantillas activas
        ListaTemplateModel.find({ activo: true }),

        // Líneas de producción de la empresa con maquinaria y frentes
        LineaModel.find({ contratistaId: empresaDoc._id, activo: true })
            .populate("harvesters", "nombreEquipo serieEquipo tipoEquipo contratistaId estado")
            .populate("forwarders", "nombreEquipo serieEquipo tipoEquipo contratistaId estado")
            .populate({
                path: "fincasDefault",
                populate: {
                    path: "nucleoId",
                    populate: { path: "zonaId" }
                }
            }),

        // Maquinaria de la empresa
        EquipoModel.find({ contratistaId: empresaDoc._id, estado: { $ne: false } }),

        // Turnos asignados a la empresa o generales
        TurnoModel.find({
            $or: [
                { contratistaId: empresaDoc._id },
                { contratistaId: null }
            ]
        }),

        // Especies forestales globales
        EspecieModel.find(),

        // Catálogo de fincas enriquecido con núcleo y zona
        FincaModel.find().populate({
            path: "nucleoId",
            populate: { path: "zonaId" }
        }),

        // Banco de preguntas para jerarquía de componentes
        PreguntasBancoModel.find({ jerarquia: { $ne: null } })
    ]);

    // 4. Operadores asignados a los equipos de esta empresa
    const equipoIds = equiposRaw.map(e => e._id);
    const operadoresRaw = await OperadorModel.find({
        equipoId: { $in: equipoIds }
    }).populate("equipoId", "nombreEquipo serieEquipo tipoEquipo");

    // 5. Estructurar árbol de componentes para fallas mecánicas
    let jerarquiaComponentes = [];
    if (preguntasBancoRaw.length > 0) {
        const found = preguntasBancoRaw.find(p => p.jerarquia && p.jerarquia.length > 0);
        if (found) {
            jerarquiaComponentes = found.jerarquia;
        }
    }

    // 6. Normalizar y estructurar fincas, núcleos y zonas
    const fincasDeLineasIds = new Set();
    lineasRaw.forEach(l => {
        if (Array.isArray(l.fincasDefault)) {
            l.fincasDefault.forEach(f => {
                if (f?._id) fincasDeLineasIds.add(String(f._id));
            });
        }
    });

    const nucleosMap = new Map();
    const zonasMap = new Map();

    const fincasFormateadas = todasFincasRaw.map(f => {
        const n = f.nucleoId;
        const z = n?.zonaId;

        if (n && n._id) {
            if (!nucleosMap.has(String(n._id))) {
                nucleosMap.set(String(n._id), {
                    _id: n._id,
                    nombreNucleo: n.nombreNucleo,
                    codeNucleo: n.codeNucleo,
                    zonaId: z?._id || n.zonaId
                });
            }
        }

        if (z && z._id) {
            if (!zonasMap.has(String(z._id))) {
                zonasMap.set(String(z._id), {
                    _id: z._id,
                    nombreZona: z.nombreZona
                });
            }
        }

        return {
            _id: f._id,
            nombreFinca: f.nombreFinca,
            codeFinca: f.codeFinca,
            nucleoId: n?._id || null,
            nombreNucleo: n?.nombreNucleo || "",
            zonaId: z?._id || null,
            nombreZona: z?.nombreZona || "",
            asignadaALinea: fincasDeLineasIds.has(String(f._id))
        };
    });

    const nucleosFormateados = Array.from(nucleosMap.values());
    const zonasFormateadas = Array.from(zonasMap.values());

    // 7. Normalizar formularios
    const formulariosFormateados = formulariosRaw.map(normalizarFormulario);

    // 8. Lista de motivos predefinidos para registro de paradas
    const motivosParadas = [
        "Falla mecánica",
        "En reparación",
        "Esperando reparación",
        "Mantenimiento menor",
        "Cambio de cadena",
        "Espera de transporte / camión",
        "Condición climática / lluvia",
        "Atasco de fuste",
        "Tanqueo / combustible",
        "Alimentación / refrigerio",
        "Otro motivo"
    ];

    // 9. Armar respuesta consolidada
    const empresasDisponibles = todosLosContratistas
        ? await ContratistaModel.find({ estado: { $ne: false } }, "_id nombre")
        : userContratistas;

    return {
        success: true,
        data: {
            empresa: {
                _id: empresaDoc._id,
                nombre: empresaDoc.nombre,
                estado: empresaDoc.estado
            },
            empresasDisponibles,
            formularios: formulariosFormateados,
            lineas: lineasRaw,
            equipos: equiposRaw,
            operadores: operadoresRaw,
            turnos: turnosRaw,
            fincas: fincasFormateadas,
            nucleos: nucleosFormateados,
            zonas: zonasFormateadas,
            especies: especiesRaw,
            jerarquiaComponentes,
            motivosParadas,
            metadata: {
                timestamp: new Date().toISOString(),
                serverVersion: "1.1.2",
                totalEquipos: equiposRaw.length,
                totalLineas: lineasRaw.length,
                totalOperadores: operadoresRaw.length,
                totalFormularios: formulariosFormateados.length
            }
        }
    };
};

