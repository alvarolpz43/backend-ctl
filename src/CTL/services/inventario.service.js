import crypto from "crypto";
import InventarioRepository from "../repositories/inventario.repository.js";
import ZonaModel from "../models/zonas.model.js";
import FincaModel from "../models/fincas.model.js";
import ContratistaModel from "../models/contratistas.model.js";
import EquipoModel from "../models/equipos.model.js";

const SISTEMAS_PREDEFINIDOS = [
  "Cab/Fuste",
  "Trad/Dim",
  "HvFw/Dim",
  "Cab/Arbcom",
];

const TIPOS_FIBRA_PREDEFINIDOS = [
  "Fibra Larga",
  "Fibra Corta",
];

/**
 * Registra múltiples registros de inventario a partir de una misma cabecera y una lista de productos.
 */
export const registrarInventarioMultiProducto = async (payload, user) => {
  const {
    fecha,
    mes,
    codigoMes,
    zonaId,
    contratistaId,
    fincaId,
    lote,
    equipoId,
    sistema,
    tipoFibra,
    productos,
    observaciones = "",
  } = payload;

  // Validación de seguridad por contratistas asignados al usuario
  const isSystemAdmin = user.role?.name?.toLowerCase() === "administrador" || user.role?.isSystem;
  if (!isSystemAdmin && user.todosLosContratistas === false) {
    const allowedContratistaIds = (user.contratistas || []).map((c) =>
      typeof c === "object" ? c._id?.toString() : c?.toString()
    );
    if (!allowedContratistaIds.includes(contratistaId.toString())) {
      return {
        success: false,
        status: 403,
        message: "No tienes permiso para registrar inventario para este contratista",
      };
    }
  }

  // Validación de seguridad por equipos asignados al usuario
  if (!isSystemAdmin && user.todosLosEquipos === false) {
    const allowedEquipoIds = (user.equipos || []).map((e) =>
      typeof e === "object" ? e._id?.toString() : e?.toString()
    );
    if (!allowedEquipoIds.includes(equipoId.toString())) {
      return {
        success: false,
        status: 403,
        message: "No tienes permiso para registrar inventario con este equipo",
      };
    }
  }

  if (!Array.isArray(productos) || productos.length === 0) {
    return {
      success: false,
      status: 400,
      message: "Debe incluir al menos un producto con sus inventarios",
    };
  }

  const grupoEnvioId = crypto.randomUUID();
  const parsedFecha = new Date(fecha);

  const recordsToInsert = productos.map((p) => {
    const invCampo = Number(p.invCampo) || 0;
    const invTransito = Number(p.invTransito) || 0;
    const invViaFinca = Number(p.invViaFinca) || 0;
    const totalInventario = Number((invCampo + invTransito + invViaFinca).toFixed(2));

    return {
      grupoEnvioId,
      fecha: parsedFecha,
      mes: mes.trim(),
      codigoMes: codigoMes.trim(),
      zonaId,
      contratistaId,
      fincaId,
      lote: lote.trim(),
      equipoId,
      sistema: sistema.trim(),
      tipoFibra: tipoFibra.trim(),
      producto: p.producto,
      invCampo,
      invTransito,
      invViaFinca,
      totalInventario,
      usuarioId: user._id,
      observaciones: observaciones ? observaciones.trim() : "",
    };
  });

  const savedRecords = await InventarioRepository.insertMany(recordsToInsert);

  return {
    success: true,
    status: 201,
    message: `Se generaron exitosamente ${savedRecords.length} registro(s) de inventario individual(es)`,
    grupoEnvioId,
    totalRegistros: savedRecords.length,
    data: savedRecords,
  };
};

/**
 * Consulta registros de inventario aplicando filtros y permisos del usuario.
 */
export const listarInventarios = async (query = {}, user) => {
  const filter = {};
  const isSystemAdmin = user.role?.name?.toLowerCase() === "administrador" || user.role?.isSystem;

  // Filtrado de seguridad por usuario
  if (!isSystemAdmin && user.todosLosContratistas === false) {
    const allowedContratistaIds = (user.contratistas || []).map((c) =>
      typeof c === "object" ? c._id : c
    );
    filter.contratistaId = { $in: allowedContratistaIds };
  }

  if (!isSystemAdmin && user.todosLosEquipos === false) {
    const allowedEquipoIds = (user.equipos || []).map((e) =>
      typeof e === "object" ? e._id : e
    );
    if (filter.equipoId) {
      // Si ya solicitó un equipo específico, verificar que esté en la lista permitida
      if (!allowedEquipoIds.map(String).includes(String(filter.equipoId))) {
        return { success: true, data: [], total: 0, totales: { totalCampo: 0, totalTransito: 0, totalViaFinca: 0, granTotal: 0 } };
      }
    } else {
      filter.equipoId = { $in: allowedEquipoIds };
    }
  }

  // Filtros de búsqueda opcionales
  if (query.contratistaId) filter.contratistaId = query.contratistaId;
  if (query.equipoId) filter.equipoId = query.equipoId;
  if (query.zonaId) filter.zonaId = query.zonaId;
  if (query.fincaId) filter.fincaId = query.fincaId;
  if (query.producto) filter.producto = query.producto;
  if (query.codigoMes) filter.codigoMes = query.codigoMes;
  if (query.lote) filter.lote = new RegExp(query.lote.trim(), "i");
  if (query.grupoEnvioId) filter.grupoEnvioId = query.grupoEnvioId;

  // Filtro por rango de fechas
  if (query.fechaInicio || query.fechaFin) {
    filter.fecha = {};
    if (query.fechaInicio) filter.fecha.$gte = new Date(query.fechaInicio);
    if (query.fechaFin) {
      const fin = new Date(query.fechaFin);
      fin.setHours(23, 59, 59, 999);
      filter.fecha.$lte = fin;
    }
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(500, parseInt(query.limit, 10) || 20));

  const [paginatedResult, totales] = await Promise.all([
    InventarioRepository.findAll(filter, { page, limit }),
    InventarioRepository.getTotales(filter),
  ]);

  return {
    success: true,
    data: paginatedResult.items,
    total: paginatedResult.total,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    totalPages: paginatedResult.totalPages,
    totales,
  };
};

/**
 * Retorna todos los catálogos necesarios para diligenciar el formulario,
 * filtrando contratistas y equipos según los permisos y asignaciones del usuario.
 */
export const obtenerCatalogoFormulario = async (user) => {
  const isSystemAdmin = user.role?.name?.toLowerCase() === "administrador" || user.role?.isSystem;

  // 1. Zonas
  const zonas = await ZonaModel.find().sort({ nombreZona: 1 });

  // 2. Fincas con su Núcleo y Zona
  const fincas = await FincaModel.find()
    .populate({
      path: "nucleoId",
      select: "_id nombreNucleo codeNucleo zonaId",
      populate: { path: "zonaId", select: "_id nombreZona codeZona" },
    })
    .sort({ nombreFinca: 1 });

  // 3. Contratistas
  let contratistasQuery = {};
  if (!isSystemAdmin && user.todosLosContratistas === false) {
    const allowedIds = (user.contratistas || []).map((c) =>
      typeof c === "object" ? c._id : c
    );
    contratistasQuery._id = { $in: allowedIds };
  }
  const contratistas = await ContratistaModel.find(contratistasQuery).sort({ nombre: 1 });

  // 4. Equipos
  let equiposQuery = {};
  if (!isSystemAdmin && user.todosLosEquipos === false) {
    const allowedEquipoIds = (user.equipos || []).map((e) =>
      typeof e === "object" ? e._id : e
    );
    equiposQuery._id = { $in: allowedEquipoIds };
  } else if (!isSystemAdmin && user.todosLosContratistas === false) {
    // Si tiene contratistas restringidos pero todos los equipos de ellos, filtrar equipos por esos contratistas
    const allowedContratistaIds = (user.contratistas || []).map((c) =>
      typeof c === "object" ? c._id : c
    );
    equiposQuery.contratistaId = { $in: allowedContratistaIds };
  }
  const equipos = await EquipoModel.find(equiposQuery)
    .populate("contratistaId", "_id nombre")
    .sort({ nombreEquipo: 1 });

  return {
    success: true,
    data: {
      zonas,
      fincas,
      contratistas,
      equipos,
      sistemasPredefinidos: SISTEMAS_PREDEFINIDOS,
      tiposFibraPredefinidos: TIPOS_FIBRA_PREDEFINIDOS,
      productosDisponibles: ["Pulpa", "Aserrio", "Biomasa"],
    },
  };
};

/**
 * Elimina un registro de inventario.
 */
export const eliminarInventarioService = async (id) => {
  const existing = await InventarioRepository.findById(id);
  if (!existing) {
    return {
      success: false,
      status: 404,
      message: "Registro de inventario no encontrado",
    };
  }

  await InventarioRepository.deleteById(id);
  return {
    success: true,
    message: "Registro de inventario eliminado correctamente",
  };
};
