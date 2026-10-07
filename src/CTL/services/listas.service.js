import {
    findAllListas,
    findListaById,
    findListaByNombre,
    saveLista,
    modifyLista,
    removeLista,
    saveRespuesta,
    findRespuestasByListaId,
    countRespuestasByListaId
} from "../repositories/listas.repository.js";
import equipoRepository from "../repositories/equipo.repository.js";
import { construirJerarquiaArbol } from "./preguntasBanco.service.js";

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

        // Mapear tipos antiguos a los tipos estándar Google Forms
        let tipo = (c.tipo || c.tipoCampo || "text").toLowerCase();
        if (tipo === "rating") tipo = "radio";
        if (tipo === "dropdown") tipo = "select";
        if (tipo === "multiselect") tipo = "checkbox";

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
        const tipo = (c.tipo || c.tipoCampo || "text").toLowerCase();
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
        const tipo = (c.tipo || c.tipoCampo || "text").toLowerCase();
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

    // Validar campos requeridos
    const camposFaltantes = [];
    for (const campo of formNorm.campos) {
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

    const nuevaRespuesta = await saveRespuesta({
        formularioId: formulario._id,
        formularioTituloSnapshot: formNorm.titulo,
        tipoEquipoSnapshot: formNorm.tipoEquipo,
        equipoId: resolvedEquipoId,
        operadorId: payload.operadorId || null,
        usuarioRegistroId: currentUser ? currentUser._id : null,
        fecha: payload.fecha ? new Date(payload.fecha) : new Date(),
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
