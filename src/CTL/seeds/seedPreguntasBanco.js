import mongoose from "mongoose";
import PreguntaBancoModel from "../models/preguntasBanco.model.js";

const DEFAULT_OPCIONES = ["BUENO", "REGULAR", "MALO", "N.A"];

export const PREGUNTAS_INICIALES = [
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
    { label: "Botiquín de primeros auxilios", categoria: "HERRAMIENTAS", tipo: "radio", opciones: DEFAULT_OPCIONES, descripcion: "Insumos vigentes y botiquín dotado" }
];

export const seedPreguntasBanco = async () => {
    console.log("🌱 Sembrando banco de preguntas de selección reutilizables...");
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
