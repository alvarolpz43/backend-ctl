import { config } from "dotenv";
import mongoose from "mongoose";
import ListaTemplateModel from "../models/listas.model.js";
import { opcionesEstructuradas, arbolComponentes } from "./resetAndSeedComponents.js";

config();

const SECCIONES_COMUNES = [
    {
        id: "sec-datos-trabajo",
        titulo: "1. Datos del Trabajo",
        descripcion: "Parámetros iniciales de operación, ubicación y turno",
        orden: 0
    },
    {
        id: "sec-cuestionario-tecnico",
        titulo: "2. Cuestionario Técnico",
        descripcion: "Estado mecánico, producción y tiempos de jornada (ramificación según funcionamiento)",
        orden: 1
    },
    {
        id: "sec-paradas-adicionales",
        titulo: "3. Registro de Paradas",
        descripcion: "Registro de paradas durante el turno de trabajo con causas y componentes afectados",
        orden: 2
    },
    {
        id: "sec-info-adicional",
        titulo: "4. Información Adicional",
        descripcion: "Condiciones del terreno, winche y novedades",
        orden: 3
    }
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
    descripcion: "Registro de paradas durante el turno con tiempo en minutos, causa y componente afectado si aplica",
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
        label: "Fecha y Hora",
        tipo: "datetime-local",
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
        label: "Especie",
        tipo: "tabla_referencia",
        tablaReferencia: "especies",
        required: true,
        orden: 6
    },
    {
        id: "turno",
        seccionId: "sec-datos-trabajo",
        label: "Turno",
        tipo: "tabla_referencia",
        tablaReferencia: "turnos",
        required: true,
        orden: 7
    },
    {
        id: "operador",
        seccionId: "sec-datos-trabajo",
        label: "Operador",
        tipo: "tabla_referencia",
        tablaReferencia: "operadores",
        required: true,
        orden: 8
    }
];

export const FORMULARIO_HARVESTER_DATA = {
    titulo: "Reporte Operacional Harvester (HV)",
    nombre: "Reporte Operacional Harvester (HV)",
    descripcion: "Formulario operacional de campo para Harvester adaptado de la app movil_ctl con ramificación condicional según estado del equipo",
    tipoEquipo: "Harvester",
    version: 1,
    activo: true,
    secciones: SECCIONES_COMUNES,
    campos: [
        ...CAMPOS_DATOS_TRABAJO,
        // 2.1 Estado del equipo (fijo, todas las pantallas)
        {
            id: "estado_equipo",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿El equipo está en funcionamiento?",
            tipo: "radio",
            opciones: ["Sí", "No"],
            required: true,
            descripcion: "Sí: Rama operativa | No: Rama no operativa",
            orden: 9
        },
        // 2.2 Preguntas operativas - Harvester (Hv) (Rama Sí)
        {
            id: "m3",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Producción en metros cúbicos (m³)?",
            tipo: "number",
            unidadMedida: "m³",
            placeholder: "0",
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 12
        },
        {
            id: "fustes_total",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿N.º total de fustes?",
            tipo: "number",
            placeholder: "0",
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 14
        },
        {
            id: "fustes_hora",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Cantidad de fustes por hora?",
            tipo: "number",
            placeholder: "0",
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 15
        },
        // Común a operativas y no operativas
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 19
        },
        // Sección 3: Registro de paradas dinámico
        CAMPO_REGISTRO_PARADAS,
        // Sección 4: Información Adicional - Harvester
        {
            id: "winche",
            seccionId: "sec-info-adicional",
            label: "¿Tiempo uso del winche (h)?",
            tipo: "number",
            unidadMedida: "h",
            placeholder: "0",
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 21
        },
        {
            id: "suelo",
            seccionId: "sec-info-adicional",
            label: "Suelo",
            tipo: "select",
            opciones: ["Humedo", "Seco"],
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
    descripcion: "Formulario operacional de campo para Forwarder adaptado de la app movil_ctl con ramificación condicional según estado del equipo",
    tipoEquipo: "Forwarder",
    version: 1,
    activo: true,
    secciones: SECCIONES_COMUNES,
    campos: [
        ...CAMPOS_DATOS_TRABAJO,
        // 2.1 Estado del equipo (fijo, todas las pantallas)
        {
            id: "estado_equipo",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿El equipo está en funcionamiento?",
            tipo: "radio",
            opciones: ["Sí", "No"],
            required: true,
            descripcion: "Sí: Rama operativa | No: Rama no operativa",
            orden: 9
        },
        // 2.3 Preguntas operativas - Forwarder (Fw) (Rama Sí)
        {
            id: "m3",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿Producción en metros cúbicos (m³)?",
            tipo: "number",
            unidadMedida: "m³",
            placeholder: "0",
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 11
        },
        {
            id: "n_cargas",
            seccionId: "sec-cuestionario-tecnico",
            label: "¿N.º de cargas extraídas del lote?",
            tipo: "number",
            placeholder: "0",
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 14
        },
        // Común a operativas y no operativas
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 18
        },
        // Sección 3: Registro de paradas dinámico
        {
            ...CAMPO_REGISTRO_PARADAS,
            orden: 19
        },
        // Sección 4: Información Adicional - Forwarder
        {
            id: "saturado",
            seccionId: "sec-info-adicional",
            label: "¿Horas Suelo Saturado?",
            tipo: "number",
            unidadMedida: "h",
            placeholder: "0",
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
            required: false,
            orden: 21
        },
        {
            id: "suelo",
            seccionId: "sec-info-adicional",
            label: "Suelo",
            tipo: "select",
            opciones: ["Humedo", "Seco"],
            condicion: { campoId: "estado_equipo", operador: "eq", valor: "Sí" },
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
    console.log("🌱 Borrando y recreando formularios operacionales de la app movil_ctl (HV y FW)...");

    // Borrar plantillas previas de Harvester y Forwarder
    const deleteResult = await ListaTemplateModel.deleteMany({
        $or: [
            { tipoEquipo: { $in: ["Harvester", "Forwarder"] } },
            { titulo: { $regex: /Harvester|Forwarder/i } },
            { nombre: { $regex: /Harvester|Forwarder/i } }
        ]
    });
    console.log(`🗑️ Formularios anteriores eliminados: ${deleteResult.deletedCount}`);

    // Crear Harvester nuevo
    const hvTemplate = await ListaTemplateModel.create(FORMULARIO_HARVESTER_DATA);
    console.log(`✅ Formulario Harvester creado: "${hvTemplate.titulo}" (${hvTemplate.campos.length} campos)`);

    // Crear Forwarder nuevo
    const fwTemplate = await ListaTemplateModel.create(FORMULARIO_FORWARDER_DATA);
    console.log(`✅ Formulario Forwarder creado: "${fwTemplate.titulo}" (${fwTemplate.campos.length} campos)`);

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
