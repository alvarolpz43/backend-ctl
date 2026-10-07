import { config } from "dotenv";
import mongoose from "mongoose";
import ListaTemplateModel from "../models/listas.model.js";
import { opcionesEstructuradas, arbolComponentes } from "./resetAndSeedComponents.js";

config();

const SECCIONES_COMUNES = [
    { id: "sec-datos-trabajo", titulo: "1. Datos del Trabajo", descripcion: "Parámetros iniciales de operación, ubicación y turno", orden: 0 },
    { id: "sec-cuestionario-tecnico", titulo: "2. Cuestionario Técnico y Operativo", descripcion: "Estado mecánico, producción y tiempos de jornada", orden: 1 },
    { id: "sec-paradas-adicionales", titulo: "3. Registro de Paradas", descripcion: "Registro dinámico de paradas eventuales en el turno", orden: 2 },
    { id: "sec-info-adicional", titulo: "4. Información Adicional y Terreno", descripcion: "Condiciones del terreno, winche y observaciones", orden: 3 }
];

export const MOTIVOS_PARADAS = [
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

const CAMPO_REGISTRO_PARADAS = {
    id: "paradas",
    seccionId: "sec-paradas-adicionales",
    label: "Registro de Paradas",
    tipo: "array_paradas",
    placeholder: "Agregar paradas registradas en el turno...",
    descripcion: "Registro dinámico de paradas durante el turno de trabajo con tiempo en minutos, motivo y componente afectado en caso de falla mecánica o reparación",
    required: false,
    opciones: MOTIVOS_PARADAS,
    jerarquia: arbolComponentes,
    niveles: ["Categoría", "Subcategoría", "Ítem / Código"],
    orden: 20
};

const CAMPOS_DATOS_TRABAJO = [
    {
        id: "equipoId",
        seccionId: "sec-datos-trabajo",
        label: "Equipo Asignado",
        tipo: "equipo_select",
        isDefaultEquipo: true,
        required: true,
        orden: 0
    },
    {
        id: "fecha",
        seccionId: "sec-datos-trabajo",
        label: "Fecha del Reporte",
        tipo: "date",
        required: true,
        orden: 1
    },
    {
        id: "zona",
        seccionId: "sec-datos-trabajo",
        label: "Zona",
        tipo: "tabla_referencia",
        tablaReferencia: "zonas",
        required: true,
        orden: 2
    },
    {
        id: "nucleo",
        seccionId: "sec-datos-trabajo",
        label: "Núcleo",
        tipo: "tabla_referencia",
        tablaReferencia: "nucleos",
        required: true,
        orden: 3
    },
    {
        id: "finca",
        seccionId: "sec-datos-trabajo",
        label: "Finca",
        tipo: "tabla_referencia",
        tablaReferencia: "fincas",
        required: true,
        orden: 4
    },
    {
        id: "lote",
        seccionId: "sec-datos-trabajo",
        label: "Lote",
        tipo: "text",
        placeholder: "Ej: Lote 14B",
        required: true,
        orden: 5
    },
    {
        id: "especie",
        seccionId: "sec-datos-trabajo",
        label: "Especie Forestal",
        tipo: "tabla_referencia",
        tablaReferencia: "especies",
        required: true,
        orden: 6
    },
    {
        id: "turno",
        seccionId: "sec-datos-trabajo",
        label: "Turno de Operación",
        tipo: "tabla_referencia",
        tablaReferencia: "turnos",
        required: true,
        orden: 7
    },
    {
        id: "operador",
        seccionId: "sec-datos-trabajo",
        label: "Operador Responsable",
        tipo: "tabla_referencia",
        tablaReferencia: "operadores",
        required: true,
        orden: 8
    }
];

export const FORMULARIO_HARVESTER_DATA = {
    titulo: "Reporte Operacional Harvester (HV)",
    nombre: "Reporte Operacional Harvester (HV)",
    descripcion: "Formulario operacional de campo para Harvester adaptado de la app movil_ctl (datos de trabajo, rendimientos, tiempos y terreno)",
    tipoEquipo: "Harvester",
    version: 1,
    activo: true,
    secciones: SECCIONES_COMUNES,
    campos: [
        ...CAMPOS_DATOS_TRABAJO,
        {
            id: "estado_equipo",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿El equipo está en funcionamiento?",
            tipo: "radio",
            opciones: ["Sí (En uso)", "No (No operativo)"],
            required: true,
            orden: 9
        },
        {
            id: "m3",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Producción en metros cúbicos (m³)?",
            tipo: "number",
            unidadMedida: "m³",
            placeholder: "0",
            required: false,
            orden: 10
        },
        {
            id: "diametro",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Diámetro medio del fuste (cm)?",
            tipo: "number",
            unidadMedida: "cm",
            placeholder: "0",
            required: false,
            orden: 11
        },
        {
            id: "pendiente",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Pendiente del terreno (en grados°)?",
            tipo: "number",
            unidadMedida: "°",
            placeholder: "0",
            required: false,
            orden: 12
        },
        {
            id: "fustes_total",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿N.º total de fustes?",
            tipo: "number",
            placeholder: "0",
            required: false,
            orden: 13
        },
        {
            id: "m3_hora",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Productividad (m³/hora)?",
            tipo: "number",
            unidadMedida: "m³/h",
            placeholder: "0",
            required: false,
            orden: 14
        },
        {
            id: "fustes_hora",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Cantidad de fustes por hora?",
            tipo: "number",
            placeholder: "0",
            required: false,
            orden: 15
        },
        {
            id: "tiempo_programado",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo programado (h)?",
            tipo: "number",
            unidadMedida: "h",
            placeholder: "8",
            required: true,
            orden: 16
        },
        {
            id: "alistamiento",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo en alistamiento (minutos)?",
            tipo: "number",
            unidadMedida: "min",
            placeholder: "0",
            required: false,
            orden: 17
        },
        {
            id: "tanqueo",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo de tanqueo (minutos)?",
            tipo: "number",
            unidadMedida: "min",
            placeholder: "0",
            required: false,
            orden: 18
        },
        {
            id: "alimentacion",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo de alimentación (minutos)?",
            tipo: "number",
            unidadMedida: "min",
            placeholder: "0",
            required: false,
            orden: 19
        },
        CAMPO_REGISTRO_PARADAS,
        {
            id: "winche",
            seccionId: "sec-info-adicional",
            label: "¿Tiempo uso del winche (h)?",
            tipo: "number",
            unidadMedida: "h",
            placeholder: "0",
            required: false,
            orden: 21
        },
        {
            id: "suelo",
            seccionId: "sec-info-adicional",
            label: "Suelo",
            tipo: "select",
            opciones: ["Humedo", "Seco"],
            required: false,
            orden: 22
        },
        {
            id: "novedad",
            seccionId: "sec-info-adicional",
            label: "Novedades",
            tipo: "textarea",
            placeholder: "Observaciones y novedades del turno",
            required: false,
            orden: 23
        }
    ]
};

export const FORMULARIO_FORWARDER_DATA = {
    titulo: "Reporte Operacional Forwarder (FW)",
    nombre: "Reporte Operacional Forwarder (FW)",
    descripcion: "Formulario operacional de campo para Forwarder adaptado de la app movil_ctl (datos de trabajo, extracción, cargas, distancias y suelo)",
    tipoEquipo: "Forwarder",
    version: 1,
    activo: true,
    secciones: SECCIONES_COMUNES,
    campos: [
        ...CAMPOS_DATOS_TRABAJO,
        {
            id: "estado_equipo",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿El equipo está en funcionamiento?",
            tipo: "radio",
            opciones: ["Sí (En uso)", "No (No operativo)"],
            required: true,
            orden: 9
        },
        {
            id: "m3",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Producción en metros cúbicos (m³)?",
            tipo: "number",
            unidadMedida: "m³",
            placeholder: "0",
            required: false,
            orden: 10
        },
        {
            id: "pendiente",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Pendiente del terreno (en grados°)?",
            tipo: "number",
            unidadMedida: "°",
            placeholder: "0",
            required: false,
            orden: 11
        },
        {
            id: "n_cargas",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿N.º de cargas extraídas del lote?",
            tipo: "number",
            placeholder: "0",
            required: false,
            orden: 12
        },
        {
            id: "peso_medio",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Peso medio por carga (toneladas)?",
            tipo: "number",
            unidadMedida: "t",
            placeholder: "0",
            required: false,
            orden: 13
        },
        {
            id: "distancia",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Distancia promedio por carga recorrida (metros)?",
            tipo: "number",
            unidadMedida: "m",
            placeholder: "0",
            required: false,
            orden: 14
        },
        {
            id: "tiempo_programado",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo programado (h)?",
            tipo: "number",
            unidadMedida: "h",
            placeholder: "8",
            required: true,
            orden: 15
        },
        {
            id: "alistamiento",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo en alistamiento (minutos)?",
            tipo: "number",
            unidadMedida: "min",
            placeholder: "0",
            required: false,
            orden: 16
        },
        {
            id: "tanqueo",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo de tanqueo (minutos)?",
            tipo: "number",
            unidadMedida: "min",
            placeholder: "0",
            required: false,
            orden: 17
        },
        {
            id: "alimentacion",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Tiempo de alimentación (minutos)?",
            tipo: "number",
            unidadMedida: "min",
            placeholder: "0",
            required: false,
            orden: 18
        },
        {
            ...CAMPO_REGISTRO_PARADAS,
            orden: 19
        },
        {
            id: "saturado",
            seccionId: "sec-info-adicional",
            label: "¿Horas Suelo Saturado?",
            tipo: "number",
            unidadMedida: "h",
            placeholder: "0",
            required: false,
            orden: 20
        },
        {
            id: "winche",
            seccionId: "sec-info-adicional",
            label: "¿Tiempo uso del winche (h)?",
            tipo: "number",
            unidadMedida: "h",
            placeholder: "0",
            required: false,
            orden: 21
        },
        {
            id: "suelo",
            seccionId: "sec-info-adicional",
            label: "Suelo",
            tipo: "select",
            opciones: ["Humedo", "Seco"],
            required: false,
            orden: 22
        },
        {
            id: "novedad",
            seccionId: "sec-info-adicional",
            label: "Novedades",
            tipo: "textarea",
            placeholder: "Observaciones y novedades del turno",
            required: false,
            orden: 23
        }
    ]
};

export const seedFormulariosMovil = async () => {
    console.log("🌱 Inicializando plantillas operacionales de la app movil_ctl (HV y FW)...");

    // 1. Harvester
    let hvTemplate = await ListaTemplateModel.findOne({
        $or: [{ titulo: FORMULARIO_HARVESTER_DATA.titulo }, { nombre: FORMULARIO_HARVESTER_DATA.nombre }]
    });

    if (hvTemplate) {
        hvTemplate.secciones = FORMULARIO_HARVESTER_DATA.secciones;
        hvTemplate.campos = FORMULARIO_HARVESTER_DATA.campos;
        hvTemplate.descripcion = FORMULARIO_HARVESTER_DATA.descripcion;
        hvTemplate.tipoEquipo = FORMULARIO_HARVESTER_DATA.tipoEquipo;
        hvTemplate.activo = true;
        await hvTemplate.save();
        console.log(`✅ Plantilla actualizada: "${FORMULARIO_HARVESTER_DATA.titulo}" (${FORMULARIO_HARVESTER_DATA.campos.length} campos)`);
    } else {
        hvTemplate = await ListaTemplateModel.create(FORMULARIO_HARVESTER_DATA);
        console.log(`✅ Plantilla creada: "${FORMULARIO_HARVESTER_DATA.titulo}" (${FORMULARIO_HARVESTER_DATA.campos.length} campos)`);
    }

    // 2. Forwarder
    let fwTemplate = await ListaTemplateModel.findOne({
        $or: [{ titulo: FORMULARIO_FORWARDER_DATA.titulo }, { nombre: FORMULARIO_FORWARDER_DATA.nombre }]
    });

    if (fwTemplate) {
        fwTemplate.secciones = FORMULARIO_FORWARDER_DATA.secciones;
        fwTemplate.campos = FORMULARIO_FORWARDER_DATA.campos;
        fwTemplate.descripcion = FORMULARIO_FORWARDER_DATA.descripcion;
        fwTemplate.tipoEquipo = FORMULARIO_FORWARDER_DATA.tipoEquipo;
        fwTemplate.activo = true;
        await fwTemplate.save();
        console.log(`✅ Plantilla actualizada: "${FORMULARIO_FORWARDER_DATA.titulo}" (${FORMULARIO_FORWARDER_DATA.campos.length} campos)`);
    } else {
        fwTemplate = await ListaTemplateModel.create(FORMULARIO_FORWARDER_DATA);
        console.log(`✅ Plantilla creada: "${FORMULARIO_FORWARDER_DATA.titulo}" (${FORMULARIO_FORWARDER_DATA.campos.length} campos)`);
    }

    return { hvTemplate, fwTemplate };
};

// Si se ejecuta directamente vía CLI
if (process.argv[1]?.endsWith("seedFormulariosMovil.js")) {
    const mongoUrl = process.env.MONGODB_URL_CTL;
    if (!mongoUrl) {
        console.error("❌ MONGODB_URL_CTL no está definido en el archivo .env");
        process.exit(1);
    }
    mongoose.connect(mongoUrl)
        .then(() => seedFormulariosMovil())
        .then(() => {
            console.log("🏁 Proceso de seed de formularios móviles completado con éxito.");
            return mongoose.disconnect();
        })
        .catch(err => {
            console.error("❌ Error ejecutando seedFormulariosMovil:", err);
            process.exit(1);
        });
}
