import { config } from "dotenv";
import mongoose from "mongoose";
import PreguntaBancoModel from "../models/preguntasBanco.model.js";
import { opcionesEstructuradas, arbolComponentes } from "./resetAndSeedComponents.js";

config();

const DEFAULT_OPCIONES = ["BUENO", "REGULAR", "MALO", "N.A"];

export const PREGUNTAS_INICIALES = [
    // COMPONENTES Y FALLAS (Reemplaza repuesto)
    {
        label: "Componente / Ítem de Maquinaria",
        categoria: "Componentes y Fallas",
        tipo: "cascading_select",
        descripcion: "Selección técnica jerárquica en cascada: Categoría > Subcategoría > Ítem con código",
        opciones: opcionesEstructuradas,
        jerarquia: arbolComponentes,
        niveles: ["Categoría", "Subcategoría", "Ítem / Código"],
        activo: true
    },
    // PARADAS OPERATIVAS DINÁMICAS
    {
        label: "Registro de Paradas",
        categoria: "Estado y Tiempos de Máquina",
        tipo: "array_paradas",
        descripcion: "Registro dinámico de paradas eventuales durante el turno (tiempo en minutos y motivo)",
        opciones: [
            "Falla mecánica",
            "Esperando reparación",
            "En reparación",
            "Espera de transporte / camión",
            "Cambio de cadena / espada",
            "Mantenimiento menor",
            "Condición climática / lluvia",
            "Atasco de fuste",
            "Tanqueo / combustible",
            "Otro motivo"
        ],
        activo: true
    },
    // EPP
    { label: "Casco - Casquete", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Inspección de integridad del casquete de protección" },
    { label: "Casco - Bandas", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Estado de las bandas de ajuste del casco" },
    { label: "Casco - Atalaje", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Suspensión y arnés interior del casco" },
    { label: "Casco - Barbuquejo", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Sujeción de mentón y hebillas" },
    { label: "Monogafas de seguridad", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Lentes limpios sin fisuras ni rayones graves" },
    { label: "Botas - Suela", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Labrado y suela antideslizante sin desgaste excesivo" },
    { label: "Botas - Puntera", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Protección de puntera de seguridad intacta" },
    { label: "Botas - Cordones", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Ajuste correcto y amarre seguro" },
    { label: "Guantes - Tipo Ingeniero", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Guantes de vaqueta sin roturas" },
    { label: "Guantes - Tipo Nitrilo", categoria: "EPP", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Manipulación de lubricantes y fluidos" },

    // MAQUINA
    { label: "Frenos de servicio y estacionamiento", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Eficacia y respuesta de frenado" },
    { label: "Estado de llantas / Orugas", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Presión, tensión y estado general del rodaje" },
    { label: "Luces de trabajo y cabina", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Faros principales, exploradoras y direccionales" },
    { label: "Pito / Señal sonora de retroceso", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Alarma sonora audible y operativa" },
    { label: "Sistema de aireación / Cabina", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Ventilación, aire acondicionado y sellado" },
    { label: "Cinturón de seguridad", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Anclaje, hebilla y retractor en buen estado" },
    { label: "Silla ergonómica del operador", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Suspensión, mandos y amortiguación" },
    { label: "Chapas y seguros de puertas/capó", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Cierre seguro de accesos y compartimentos" },
    { label: "Fugas hidráulicas y de motor", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Revisión de mangueras, cilindros y motor" },
    { label: "Cámaras de reversa y monitores", categoria: "MÁQUINA", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Visibilidad limpia en pantallas de cabina" },

    // HERRAMIENTAS Y APOYO
    { label: "Radio Teléfono / Comunicación", categoria: "HERRAMIENTAS", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Señal y carga de radio en canal operativo" },
    { label: "Kit básico de herramienta", categoria: "HERRAMIENTAS", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Llaves, destornilladores y dados completos" },
    { label: "Extintor contra incendios", categoria: "HERRAMIENTAS", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Manómetro en zona verde y fecha de vigencia al día" },
    { label: "Botiquín de primeros auxilios", categoria: "HERRAMIENTAS", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Insumos vigentes y botiquín dotado" },

    // DATOS DEL TRABAJO (movil_ctl)
    { label: "Zona de Operación", categoria: "Datos del Trabajo", tipo: "tabla_referencia", tablaReferencia: "zonas", opciones: [], descripcion: "Zona geográfica vinculada" },
    { label: "Núcleo Forestal", categoria: "Datos del Trabajo", tipo: "tabla_referencia", tablaReferencia: "nucleos", opciones: [], descripcion: "Núcleo de la plantación" },
    { label: "Finca / Predio", categoria: "Datos del Trabajo", tipo: "tabla_referencia", tablaReferencia: "fincas", opciones: [], descripcion: "Predio o finca en cosecha" },
    { label: "Especie Forestal Cosechada", categoria: "Datos del Trabajo", tipo: "tabla_referencia", tablaReferencia: "especies", opciones: [], descripcion: "Especie de madera procesada" },
    { label: "Turno de Operación", categoria: "Datos del Trabajo", tipo: "tabla_referencia", tablaReferencia: "turnos", opciones: [], descripcion: "Turno asignado" },
    { label: "Operador a Cargo", categoria: "Datos del Trabajo", tipo: "tabla_referencia", tablaReferencia: "operadores", opciones: [], descripcion: "Operador calificado de la máquina" },

    // ESTADO Y TIEMPOS DE MÁQUINA (movil_ctl)
    { label: "¿El equipo está en funcionamiento?", categoria: "Estado y Tiempos de Máquina", tipo: "radio", opciones: ["Sí (En uso)", "No (No operativo)"], descripcion: "Condición operativa inicial de la máquina" },
    { label: "¿Tiempo programado (h)?", categoria: "Estado y Tiempos de Máquina", tipo: "number", unidadMedida: "h", opciones: [], descripcion: "Horas totales programadas para el turno" },
    { label: "¿Tiempo en alistamiento (minutos)?", categoria: "Estado y Tiempos de Máquina", tipo: "number", unidadMedida: "min", opciones: [], descripcion: "Tiempo de inspección y puesta a punto" },
    { label: "¿Tiempo de tanqueo (minutos)?", categoria: "Estado y Tiempos de Máquina", tipo: "number", unidadMedida: "min", opciones: [], descripcion: "Carga de combustible" },
    { label: "¿Tiempo de alimentación (minutos)?", categoria: "Estado y Tiempos de Máquina", tipo: "number", unidadMedida: "min", opciones: [], descripcion: "Pausa de refrigerio o almuerzo" },

    // OPERACIÓN HARVESTER (HV)
    { label: "¿Producción en metros cúbicos (m³)?", categoria: "Operación Harvester", tipo: "number", unidadMedida: "m³", opciones: [], descripcion: "Volumen cosechado en el turno" },
    { label: "¿Diámetro medio del fuste (cm)?", categoria: "Operación Harvester", tipo: "number", unidadMedida: "cm", opciones: [], descripcion: "Grosor promedio de trozas cosechadas" },
    { label: "¿Pendiente del terreno (en grados°)?", categoria: "Operación Harvester", tipo: "number", unidadMedida: "°", opciones: [], descripcion: "Inclinación del rodal cosechado" },
    { label: "¿N.º total de fustes?", categoria: "Operación Harvester", tipo: "number", opciones: [], descripcion: "Conteo total de árboles/fustes procesados" },
    { label: "¿Productividad (m³/hora)?", categoria: "Operación Harvester", tipo: "number", unidadMedida: "m³/h", opciones: [], descripcion: "Rendimiento horario de producción" },
    { label: "¿Cantidad de fustes por hora?", categoria: "Operación Harvester", tipo: "number", opciones: [], descripcion: "Rendimiento horario en piezas" },

    // OPERACIÓN FORWARDER (FW)
    { label: "¿N.º de cargas extraídas del lote?", categoria: "Operación Forwarder", tipo: "number", opciones: [], descripcion: "Cantidad de ciclos o viajes completados" },
    { label: "¿Peso medio por carga (toneladas)?", categoria: "Operación Forwarder", tipo: "number", unidadMedida: "t", opciones: [], descripcion: "Tonelaje promedio transportado" },
    { label: "¿Distancia promedio por carga recorrida (metros)?", categoria: "Operación Forwarder", tipo: "number", unidadMedida: "m", opciones: [], descripcion: "Distancia media de desembosque" },

    // TERRENO E INFORMACIÓN ADICIONAL
    { label: "¿Tiempo uso del winche (h)?", categoria: "Terreno e Información Adicional", tipo: "number", unidadMedida: "h", opciones: [], descripcion: "Horas de tracción asistida por winche" },
    { label: "¿Horas Suelo Saturado?", categoria: "Terreno e Información Adicional", tipo: "number", unidadMedida: "h", opciones: [], descripcion: "Operación sobre terreno fangoso/saturado" },
    { label: "Suelo", categoria: "Terreno e Información Adicional", tipo: "select", opciones: ["Humedo", "Seco"], descripcion: "Condición física superficial del terreno" },
    { label: "Novedades del Turno", categoria: "Terreno e Información Adicional", tipo: "radio", opciones: [], descripcion: "Observaciones generales de la jornada" }
];

export const seedPreguntasBanco = async () => {
    console.log("🌱 Sembrando banco de preguntas de selección reutilizables...");
    // Eliminar preguntas obsoletas que ya no deben ir separadas
    const obsoletas = [
        "¿Tiempo de paradas mecánicas (minutos)?",
        "Especificar parada mecanica"
    ];
    await PreguntaBancoModel.deleteMany({ label: { $in: obsoletas } });

    let creadas = 0;
    for (const preg of PREGUNTAS_INICIALES) {
        const existe = await PreguntaBancoModel.findOne({ label: preg.label });
        if (!existe) {
            await PreguntaBancoModel.create(preg);
            creadas++;
        }
    }
    console.log(`✅ Banco de preguntas inicializado: ${creadas} preguntas nuevas creadas.`);
};

// Si se ejecuta directamente
if (process.argv[1]?.endsWith("seedPreguntasBanco.js")) {
    const mongoUrl = process.env.MONGODB_URL_CTL;
    if (!mongoUrl) {
        console.error("MONGODB_URL_CTL no definido");
        process.exit(1);
    }
    mongoose.connect(mongoUrl)
        .then(() => seedPreguntasBanco())
        .then(() => mongoose.disconnect())
        .catch(err => {
            console.error("Error en seedPreguntasBanco:", err);
            process.exit(1);
        });
}
