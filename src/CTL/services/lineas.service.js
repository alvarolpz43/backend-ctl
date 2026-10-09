import mongoose from "mongoose";
import lineasRepository from "../repositories/lineas.repository.js";
import equipoModel from "../models/equipos.model.js";
import contratistasModel from "../models/contratistas.model.js";

export const getAllLineas = async (query = {}) => {
  try {
    const lineas = await lineasRepository.findAll(query);
    return {
      success: true,
      data: lineas || [],
    };
  } catch (error) {
    console.error("Error al obtener líneas:", error);
    return {
      success: false,
      message: error.message || "Error al obtener líneas",
    };
  }
};

export const getLineaById = async (id) => {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "ID de línea no válido", status: 400 };
    }
    const linea = await lineasRepository.findById(id);
    if (!linea) {
      return { success: false, message: "Línea no encontrada", status: 404 };
    }
    return { success: true, data: linea };
  } catch (error) {
    console.error("Error al obtener línea:", error);
    return { success: false, message: error.message, status: 500 };
  }
};

export const createLinea = async (data) => {
  try {
    const { nombre, contratistaId, harvesters = [], forwarders = [], fincasDefault = [], metaMinimaDefecto = 5000 } = data;

    if (!nombre || !nombre.trim()) {
      return { success: false, message: "El nombre de la línea es obligatorio", status: 400 };
    }

    if (!contratistaId || !mongoose.Types.ObjectId.isValid(contratistaId)) {
      return { success: false, message: "Debe seleccionar un contratista válido", status: 400 };
    }

    const contratistaExistente = await contratistasModel.findById(contratistaId);
    if (!contratistaExistente) {
      return { success: false, message: "El contratista seleccionado no existe", status: 404 };
    }

    if (!Array.isArray(harvesters) || harvesters.length === 0) {
      return { success: false, message: "La línea debe tener al menos un Harvester (HV)", status: 400 };
    }

    if (!Array.isArray(forwarders) || forwarders.length === 0) {
      return { success: false, message: "La línea debe tener al menos un Forwarder (FW)", status: 400 };
    }

    // Validar que todos los Harvesters pertenezcan al contratista y sean tipo Harvester
    const hvEquipos = await equipoModel.find({ _id: { $in: harvesters } });
    if (hvEquipos.length !== harvesters.length) {
      return { success: false, message: "Uno o más Harvesters seleccionados no existen", status: 400 };
    }

    for (const hv of hvEquipos) {
      if (hv.contratistaId.toString() !== contratistaId.toString()) {
        return {
          success: false,
          message: `El Harvester "${hv.nombreEquipo}" no pertenece a la empresa seleccionada (${contratistaExistente.nombre})`,
          status: 400,
        };
      }
      if (hv.tipoEquipo !== "Harvester") {
        return {
          success: false,
          message: `El equipo "${hv.nombreEquipo}" no es de tipo Harvester`,
          status: 400,
        };
      }
    }

    // Validar que todos los Forwarders pertenezcan al contratista y sean tipo Forwarder
    const fwEquipos = await equipoModel.find({ _id: { $in: forwarders } });
    if (fwEquipos.length !== forwarders.length) {
      return { success: false, message: "Uno o más Forwarders seleccionados no existen", status: 400 };
    }

    for (const fw of fwEquipos) {
      if (fw.contratistaId.toString() !== contratistaId.toString()) {
        return {
          success: false,
          message: `El Forwarder "${fw.nombreEquipo}" no pertenece a la empresa seleccionada (${contratistaExistente.nombre})`,
          status: 400,
        };
      }
      if (fw.tipoEquipo !== "Forwarder") {
        return {
          success: false,
          message: `El equipo "${fw.nombreEquipo}" no es de tipo Forwarder`,
          status: 400,
        };
      }
    }

    // Validar que ningún Harvester o Forwarder esté ya asignado a otra línea activa
    const lineasActivas = await lineasRepository.findAll({ activo: true });
    for (const lin of lineasActivas) {
      for (const hId of harvesters) {
        const linHvs = (lin.harvesters || []).map((h) => (h._id || h).toString());
        if (linHvs.includes(hId.toString())) {
          const eq = hvEquipos.find((e) => e._id.toString() === hId.toString());
          return {
            success: false,
            message: `El Harvester "${eq ? eq.nombreEquipo : hId}" ya está asignado a la línea "${lin.nombre}"`,
            status: 400,
          };
        }
      }
      for (const fId of forwarders) {
        const linFws = (lin.forwarders || []).map((f) => (f._id || f).toString());
        if (linFws.includes(fId.toString())) {
          const eq = fwEquipos.find((e) => e._id.toString() === fId.toString());
          return {
            success: false,
            message: `El Forwarder "${eq ? eq.nombreEquipo : fId}" ya está asignado a la línea "${lin.nombre}"`,
            status: 400,
          };
        }
      }
    }

    const newLinea = await lineasRepository.create({
      nombre: nombre.trim(),
      contratistaId,
      harvesters,
      forwarders,
      fincasDefault,
      metaMinimaDefecto: Number(metaMinimaDefecto) > 0 ? Number(metaMinimaDefecto) : 5000,
      horasProgramadasDefecto: Number(data.horasProgramadasDefecto) >= 0 ? Number(data.horasProgramadasDefecto) : 0,
      activo: data.activo !== false,
    });

    const populated = await lineasRepository.findById(newLinea._id);

    return {
      success: true,
      message: "Línea de producción creada exitosamente",
      data: populated,
    };
  } catch (error) {
    console.error("Error al crear línea:", error);
    return { success: false, message: error.message || "Error al crear línea", status: 500 };
  }
};

export const updateLinea = async (id, data) => {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "ID de línea no válido", status: 400 };
    }

    const lineaExistente = await lineasRepository.findById(id);
    if (!lineaExistente) {
      return { success: false, message: "Línea no encontrada", status: 404 };
    }

    const contratistaId = data.contratistaId || lineaExistente.contratistaId._id || lineaExistente.contratistaId;
    const harvesters = data.harvesters !== undefined ? data.harvesters : lineaExistente.harvesters.map((h) => h._id || h);
    const forwarders = data.forwarders !== undefined ? data.forwarders : lineaExistente.forwarders.map((f) => f._id || f);

    if (data.nombre && !data.nombre.trim()) {
      return { success: false, message: "El nombre de la línea no puede estar vacío", status: 400 };
    }

    if (harvesters.length === 0) {
      return { success: false, message: "La línea debe tener al menos un Harvester", status: 400 };
    }

    if (forwarders.length === 0) {
      return { success: false, message: "La línea debe tener al menos un Forwarder", status: 400 };
    }

    // Validar harvesters
    const hvEquipos = await equipoModel.find({ _id: { $in: harvesters } });
    for (const hv of hvEquipos) {
      if (hv.contratistaId.toString() !== contratistaId.toString()) {
        return {
          success: false,
          message: `El Harvester "${hv.nombreEquipo}" no pertenece a la empresa de la línea`,
          status: 400,
        };
      }
      if (hv.tipoEquipo !== "Harvester") {
        return {
          success: false,
          message: `El equipo "${hv.nombreEquipo}" no es de tipo Harvester`,
          status: 400,
        };
      }
    }

    // Validar forwarders
    const fwEquipos = await equipoModel.find({ _id: { $in: forwarders } });
    for (const fw of fwEquipos) {
      if (fw.contratistaId.toString() !== contratistaId.toString()) {
        return {
          success: false,
          message: `El Forwarder "${fw.nombreEquipo}" no pertenece a la empresa de la línea`,
          status: 400,
        };
      }
      if (fw.tipoEquipo !== "Forwarder") {
        return {
          success: false,
          message: `El equipo "${fw.nombreEquipo}" no es de tipo Forwarder`,
          status: 400,
        };
      }
    }

    // Validar que ningún Harvester o Forwarder esté ya asignado a otra línea activa (excluyendo la actual)
    const lineasActivas = await lineasRepository.findAll({ activo: true });
    for (const lin of lineasActivas) {
      if (lin._id.toString() === id.toString()) continue;
      for (const hId of harvesters) {
        const linHvs = (lin.harvesters || []).map((h) => (h._id || h).toString());
        if (linHvs.includes(hId.toString())) {
          const eq = hvEquipos.find((e) => e._id.toString() === hId.toString());
          return {
            success: false,
            message: `El Harvester "${eq ? eq.nombreEquipo : hId}" ya está asignado a la línea "${lin.nombre}"`,
            status: 400,
          };
        }
      }
      for (const fId of forwarders) {
        const linFws = (lin.forwarders || []).map((f) => (f._id || f).toString());
        if (linFws.includes(fId.toString())) {
          const eq = fwEquipos.find((e) => e._id.toString() === fId.toString());
          return {
            success: false,
            message: `El Forwarder "${eq ? eq.nombreEquipo : fId}" ya está asignado a la línea "${lin.nombre}"`,
            status: 400,
          };
        }
      }
    }

    const updatePayload = {
      ...(data.nombre && { nombre: data.nombre.trim() }),
      ...(data.contratistaId && { contratistaId }),
      harvesters,
      forwarders,
      ...(data.fincasDefault && { fincasDefault: data.fincasDefault }),
      ...(data.metaMinimaDefecto !== undefined && { metaMinimaDefecto: Number(data.metaMinimaDefecto) || 5000 }),
      ...(data.horasProgramadasDefecto !== undefined && { horasProgramadasDefecto: Number(data.horasProgramadasDefecto) >= 0 ? Number(data.horasProgramadasDefecto) : 0 }),
      ...(data.activo !== undefined && { activo: Boolean(data.activo) }),
    };

    const updated = await lineasRepository.update(id, updatePayload);
    return {
      success: true,
      message: "Línea de producción actualizada exitosamente",
      data: updated,
    };
  } catch (error) {
    console.error("Error al actualizar línea:", error);
    return { success: false, message: error.message || "Error al actualizar línea", status: 500 };
  }
};

export const deleteLinea = async (id) => {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "ID de línea no válido", status: 400 };
    }
    const deleted = await lineasRepository.deleteById(id);
    if (!deleted) {
      return { success: false, message: "Línea no encontrada", status: 404 };
    }
    return {
      success: true,
      message: "Línea eliminada exitosamente",
    };
  } catch (error) {
    console.error("Error al eliminar línea:", error);
    return { success: false, message: error.message, status: 500 };
  }
};
