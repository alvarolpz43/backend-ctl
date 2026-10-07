import {
    findAllPreguntasBanco,
    findPreguntaBancoById,
    findPreguntaBancoByLabel,
    savePreguntaBanco,
    modifyPreguntaBanco,
    removePreguntaBanco
} from "../repositories/preguntasBanco.repository.js";

export const getAllPreguntasBancoService = async (query = {}) => {
    const mongoQuery = {};
    if (query.categoria && query.categoria !== "TODAS") {
        mongoQuery.categoria = query.categoria;
    }
    if (query.search) {
        mongoQuery.$or = [
            { label: { $regex: query.search, $options: "i" } },
            { categoria: { $regex: query.search, $options: "i" } },
            { descripcion: { $regex: query.search, $options: "i" } }
        ];
    }
    if (query.activo !== undefined) {
        mongoQuery.activo = query.activo === "true" || query.activo === true;
    }

    const preguntas = await findAllPreguntasBanco(mongoQuery);
    return {
        success: true,
        total: preguntas.length,
        data: preguntas
    };
};

const normalizeOpcion = (opt) => {
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
};

export const construirJerarquiaArbol = (opciones) => {
    if (!Array.isArray(opciones)) return null;
    const catMap = new Map();

    opciones.forEach(opt => {
        if (!opt) return;
        if (typeof opt === "object") {
            const cat = (opt.categoria || "General").trim();
            const subcat = (opt.subcategoria || "General").trim();
            const codigo = opt.codigo !== undefined ? String(opt.codigo).trim() : "";
            const item = opt.item !== undefined ? String(opt.item).trim() : (opt.label || opt.value || "");
            const label = opt.label ? String(opt.label).trim() : (codigo && item ? `[${codigo}] ${item}` : item || codigo);
            const value = opt.value !== undefined ? String(opt.value).trim() : (codigo || item || label);

            if (!catMap.has(cat)) catMap.set(cat, new Map());
            const subMap = catMap.get(cat);
            if (!subMap.has(subcat)) subMap.set(subcat, []);
            subMap.get(subcat).push({ codigo, item, label, value });
        }
    });

    if (catMap.size === 0) return null;

    const res = [];
    catMap.forEach((subMap, catNombre) => {
        const subcategorias = [];
        subMap.forEach((items, subNombre) => {
            subcategorias.push({ nombre: subNombre, items });
        });
        res.push({ nombre: catNombre, subcategorias });
    });
    return res;
};

export const createPreguntaBancoService = async (data) => {
    const label = (data.label || "").trim();
    if (!label) {
        return { success: false, message: "El texto o título de la pregunta es obligatorio" };
    }

    const existe = await findPreguntaBancoByLabel(label);
    if (existe) {
        return { success: false, message: "Ya existe una pregunta con ese nombre en el banco" };
    }

    const opciones = Array.isArray(data.opciones)
        ? data.opciones.map(normalizeOpcion).filter(Boolean)
        : ["BUENO", "REGULAR", "MALO", "N.A"];

    if (opciones.length === 0) {
        return { success: false, message: "La pregunta de selección debe tener al menos una opción" };
    }

    const jerarquia = data.jerarquia || construirJerarquiaArbol(opciones);
    const niveles = data.niveles || (jerarquia ? ["Categoría", "Subcategoría", "Ítem / Código"] : []);

    const nueva = await savePreguntaBanco({
        label,
        tipo: data.tipo || "radio",
        opciones,
        jerarquia,
        niveles,
        categoria: (data.categoria || "General").trim(),
        descripcion: (data.descripcion || "").trim(),
        activo: data.activo !== undefined ? data.activo : true
    });

    return {
        success: true,
        message: "Pregunta agregada al banco exitosamente",
        data: nueva
    };
};

export const updatePreguntaBancoService = async (id, data) => {
    const actual = await findPreguntaBancoById(id);
    if (!actual) {
        return { success: false, message: "Pregunta no encontrada en el banco" };
    }

    const updates = { ...data };
    if (updates.label) {
        updates.label = updates.label.trim();
        if (updates.label !== actual.label) {
            const existe = await findPreguntaBancoByLabel(updates.label);
            if (existe && existe._id.toString() !== id) {
                return { success: false, message: "Ya existe otra pregunta con ese nombre en el banco" };
            }
        }
    }
    if (updates.categoria) updates.categoria = updates.categoria.trim();
    if (updates.descripcion !== undefined) updates.descripcion = (updates.descripcion || "").trim();
    if (Array.isArray(updates.opciones)) {
        updates.opciones = updates.opciones.map(normalizeOpcion).filter(Boolean);
        if (updates.opciones.length === 0) {
            return { success: false, message: "La pregunta de selección debe tener al menos una opción" };
        }
        updates.jerarquia = data.jerarquia || construirJerarquiaArbol(updates.opciones);
        updates.niveles = data.niveles || (updates.jerarquia ? ["Categoría", "Subcategoría", "Ítem / Código"] : []);
    }

    const actualizada = await modifyPreguntaBanco(id, updates);
    return {
        success: true,
        message: "Pregunta actualizada exitosamente",
        data: actualizada
    };
};

export const deletePreguntaBancoService = async (id) => {
    const actual = await findPreguntaBancoById(id);
    if (!actual) {
        return { success: false, message: "Pregunta no encontrada" };
    }

    await removePreguntaBanco(id);
    return {
        success: true,
        message: "Pregunta eliminada del banco"
    };
};
