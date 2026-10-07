import mongoose from "mongoose";
import planeacionRepository from "../repositories/planeacion.repository.js";
import lineasRepository from "../repositories/lineas.repository.js";
import respuestaListaModel from "../models/respuestasLista.model.js";

const MESES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const getPlaneacionPorPeriodo = async (anio, mes) => {
  try {
    const anioNum = Number(anio);
    const mesNum = Number(mes);
    if (!anioNum || !mesNum || mesNum < 1 || mesNum > 12) {
      return { success: false, message: "Año y mes válidos son requeridos", status: 400 };
    }

    const periodo = `${anioNum}-${String(mesNum).padStart(2, "0")}`;
    const plan = await planeacionRepository.findByPeriodo(periodo);

    // Si aún no existe la planeación para este mes, retornamos data: null
    if (!plan) {
      return {
        success: true,
        data: null,
      };
    }

    // Calcular la ejecución real en base a información operacional
    const planConEjecucion = await calcularEjecucionPlaneacion(plan, anioNum, mesNum);

    return {
      success: true,
      data: planConEjecucion,
    };
  } catch (error) {
    console.error("Error al obtener planeación:", error);
    return { success: false, message: error.message || "Error al obtener planeación", status: 500 };
  }
};

export const upsertPlaneacion = async (data) => {
  try {
    const { anio, mes, nombre, lineasConfig = [], estado = "activo", notas = "" } = data;
    const anioNum = Number(anio);
    const mesNum = Number(mes);

    if (!anioNum || !mesNum || mesNum < 1 || mesNum > 12) {
      return { success: false, message: "Año y mes válidos son requeridos", status: 400 };
    }

    const periodo = `${anioNum}-${String(mesNum).padStart(2, "0")}`;
    const defaultNombre = `${MESES_NOMBRES[mesNum - 1]} ${anioNum}`;
    const planNombre = nombre && nombre.trim() ? nombre.trim() : defaultNombre;

    // Validar y normalizar configuración de líneas
    const cleanLineasConfig = lineasConfig.map((item) => {
      const meta = Number(item.metaMinimaToneladas);
      return {
        lineaId: item.lineaId,
        nombreLinea: item.nombreLinea || "Línea",
        contratistaId: item.contratistaId,
        harvesters: Array.isArray(item.harvesters) ? item.harvesters : [],
        forwarders: Array.isArray(item.forwarders) ? item.forwarders : [],
        fincas: Array.isArray(item.fincas) ? item.fincas : [],
        metaMinimaToneladas: !isNaN(meta) && meta > 0 ? meta : 5000,
      };
    });

    let plan = await planeacionRepository.findByPeriodo(periodo);
    if (plan) {
      plan = await planeacionRepository.update(plan._id, {
        nombre: planNombre,
        lineasConfig: cleanLineasConfig,
        estado,
        notas,
      });
    } else {
      plan = await planeacionRepository.create({
        nombre: planNombre,
        anio: anioNum,
        mes: mesNum,
        periodo,
        estado,
        lineasConfig: cleanLineasConfig,
        notas,
      });
      plan = await planeacionRepository.findById(plan._id);
    }

    const planConEjecucion = await calcularEjecucionPlaneacion(plan, anioNum, mesNum);

    return {
      success: true,
      message: "Planeación mensual guardada exitosamente",
      data: planConEjecucion,
    };
  } catch (error) {
    console.error("Error al guardar planeación:", error);
    return { success: false, message: error.message || "Error al guardar planeación", status: 500 };
  }
};

export const deletePlaneacion = async (id) => {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "ID de planeación inválido", status: 400 };
    }

    const plan = await planeacionRepository.findById(id);
    if (!plan) {
      return { success: false, message: "Planeación no encontrada", status: 404 };
    }

    await planeacionRepository.deleteById(id);

    return {
      success: true,
      message: "Planeación eliminada exitosamente",
      data: { id },
    };
  } catch (error) {
    console.error("Error al eliminar planeación:", error);
    return { success: false, message: error.message || "Error al eliminar planeación", status: 500 };
  }
};

export const getAllPlaneaciones = async () => {
  try {
    const planeaciones = await planeacionRepository.findAll();
    return {
      success: true,
      data: planeaciones || [],
    };
  } catch (error) {
    console.error("Error al listar planeaciones:", error);
    return { success: false, message: error.message, status: 500 };
  }
};

/**
 * Función que computa la ejecución real para cada línea en base a la información operacional reportada
 * REGLA DE NEGOCIO:
 * 1. El Harvester (HV) derriba/troza y dictamina cuánto se saca mensual (Producción de la Línea).
 * 2. Esa producción de los HV de la línea se divide equitativamente entre los Forwarders (FW) de la línea.
 */
async function calcularEjecucionPlaneacion(plan, anio, mes) {
  const startDate = new Date(anio, mes - 1, 1, 0, 0, 0);
  const endDate = new Date(anio, mes, 0, 23, 59, 59, 999);

  // Consultar todas las respuestas operacionales del mes
  const respuestasMes = await respuestaListaModel.find({
    fecha: { $gte: startDate, $lte: endDate },
  }).populate("equipoId", "nombreEquipo serieEquipo tipoEquipo contratistaId")
    .populate("fincaId", "nombreFinca codeFinca nucleoId");

  const lineasResumen = [];
  let metaTotalMes = 0;
  let produccionTotalMes = 0;

  for (const item of plan.lineasConfig || []) {
    const metaMinima = Number(item.metaMinimaToneladas) || 5000;
    metaTotalMes += metaMinima;

    const hvIds = (item.harvesters || []).map((h) => (h._id ? h._id.toString() : h.toString()));
    const fwIds = (item.forwarders || []).map((f) => (f._id ? f._id.toString() : f.toString()));
    const fincasIds = (item.fincas || []).map((f) => (f._id ? f._id.toString() : f.toString()));

    // 1. Calcular producción de cada Harvester de la línea
    const harvestersDetalle = (item.harvesters || []).map((hv) => {
      const hvIdStr = (hv._id || hv).toString();
      const reportesHv = respuestasMes.filter((r) => {
        const matchEquipo = r.equipoId && (r.equipoId._id || r.equipoId).toString() === hvIdStr;
        // Si la línea tiene fincas asignadas, filtra por esas fincas; si no, toma todas
        const matchFinca = fincasIds.length === 0 || (r.fincaId && fincasIds.includes((r.fincaId._id || r.fincaId).toString()));
        return matchEquipo && matchFinca;
      });

      const toneladasReportadas = reportesHv.reduce((acc, r) => {
        const val = Number(r.produccionToneladas) || 0;
        return acc + val;
      }, 0);

      return {
        _id: hv._id || hv,
        nombreEquipo: hv.nombreEquipo || "Harvester",
        serieEquipo: hv.serieEquipo || "",
        toneladas: toneladasReportadas,
        cantidadReportes: reportesHv.length,
      };
    });

    // Producción total de la línea (dictaminada por los Harvesters)
    const produccionLineaHV = harvestersDetalle.reduce((acc, h) => acc + h.toneladas, 0);
    produccionTotalMes += produccionLineaHV;

    // 2. Distribuir equitativamente entre los Forwarders de la línea
    const cantFw = item.forwarders ? item.forwarders.length : 0;
    const toneladasPorFw = cantFw > 0 ? Number((produccionLineaHV / cantFw).toFixed(2)) : 0;

    const forwardersDetalle = (item.forwarders || []).map((fw) => {
      const fwIdStr = (fw._id || fw).toString();
      const reportesFw = respuestasMes.filter((r) => {
        return r.equipoId && (r.equipoId._id || r.equipoId).toString() === fwIdStr;
      });

      return {
        _id: fw._id || fw,
        nombreEquipo: fw.nombreEquipo || "Forwarder",
        serieEquipo: fw.serieEquipo || "",
        toneladasAtribuidas: toneladasPorFw,
        cantidadReportesOperacion: reportesFw.length,
      };
    });

    const porcentajeCumplimiento = metaMinima > 0
      ? Number(((produccionLineaHV / metaMinima) * 100).toFixed(1))
      : 0;

    lineasResumen.push({
      lineaId: item.lineaId,
      nombreLinea: item.nombreLinea,
      contratista: item.contratistaId,
      fincas: item.fincas || [],
      metaMinimaToneladas: metaMinima,
      produccionRealToneladas: produccionLineaHV,
      porcentajeCumplimiento,
      diferenciaMeta: Number((produccionLineaHV - metaMinima).toFixed(2)),
      harvesters: harvestersDetalle,
      forwarders: forwardersDetalle,
      cantidadForwarders: cantFw,
      toneladasPorForwarder: toneladasPorFw,
    });
  }

  const porcentajeCumplimientoMes = metaTotalMes > 0
    ? Number(((produccionTotalMes / metaTotalMes) * 100).toFixed(1))
    : 0;

  const planObj = plan && typeof plan.toObject === "function" ? plan.toObject() : { ...plan };
  const mesIdx = (planObj.mes || mes) - 1;
  const mesNombre = MESES_NOMBRES[mesIdx] || `Mes ${planObj.mes || mes}`;
  const defaultNombre = `${mesNombre} ${planObj.anio || anio}`;
  planObj.nombre = planObj.nombre || defaultNombre;

  return {
    ...planObj,
    kpis: {
      metaTotalMes,
      produccionTotalMes,
      porcentajeCumplimientoMes,
      diferenciaMes: Number((produccionTotalMes - metaTotalMes).toFixed(2)),
      cantidadLineas: lineasResumen.length,
    },
    lineasResumen,
  };
}
