import { config } from "dotenv";
import mongoose from "mongoose";
import ListaTemplateModel from "../models/listas.model.js";

config();

const RATING_OPCIONES = [
    { label: "BUENO", value: "BUENO", esConforme: true, color: "#10b981" },
    { label: "REGULAR", value: "REGULAR", esConforme: false, color: "#f59e0b" },
    { label: "MALO", value: "MALO", esConforme: false, color: "#ef4444" },
    { label: "N.A", value: "N.A", esConforme: true, color: "#6b7280" }
];

export const seedListaHVFW = async () => {
    const NOMBRE = "Información Operacional LHC Operador HV-FW";
    const CODIGO = "REG-SI-12-03";

    // Actualizar si existe con el nombre antiguo
    await ListaTemplateModel.updateMany(
        { nombre: "Lista de Chequeo LHC Operador HV-FW" },
        { 
            nombre: NOMBRE,
            descripcion: "Información operacional y de seguridad industrial para operadores de Harvester y Forwarder (HV-FW)"
        }
    );

    const existe = await ListaTemplateModel.findOne({ $or: [{ nombre: NOMBRE }, { codigo: CODIGO }] });
    if (existe) {
        if (existe.nombre !== NOMBRE) {
            existe.nombre = NOMBRE;
            await existe.save();
        }
        console.log(`ℹ️ La plantilla "${NOMBRE}" ya existe en la base de datos.`);
        return existe;
    }

    const secciones = [
        { id: "sec-epp", nombre: "EPP (Elementos de Protección Personal)", orden: 1, esRepetible: false },
        { id: "sec-maquina", nombre: "MÁQUINA (Harvester / Forwarder)", orden: 2, esRepetible: false },
        { id: "sec-herramientas", nombre: "HERRAMIENTAS Y ELEMENTOS DE APOYO", orden: 3, esRepetible: false }
    ];

    const preguntas = [
        // EPP
        { id: "p-epp-1", seccionId: "sec-epp", elemento: "Casco", detalle: "Casquete", texto: "Casco - Casquete", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 1, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-epp-2", seccionId: "sec-epp", elemento: "Casco", detalle: "Bandas", texto: "Casco - Bandas", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 2, requerido: true, esDeterminante: false, generaNovedad: true },
        { id: "p-epp-3", seccionId: "sec-epp", elemento: "Casco", detalle: "Atalaje", texto: "Casco - Atalaje", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 3, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-epp-4", seccionId: "sec-epp", elemento: "Casco", detalle: "Barbuquejo", texto: "Casco - Barbuquejo", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 4, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-epp-5", seccionId: "sec-epp", elemento: "Monogafas", detalle: "Monogafas", texto: "Monogafas", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 5, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-epp-6", seccionId: "sec-epp", elemento: "Botas", detalle: "Suela", texto: "Botas - Suela", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 6, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-epp-7", seccionId: "sec-epp", elemento: "Botas", detalle: "Puntera", texto: "Botas - Puntera", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 7, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-epp-8", seccionId: "sec-epp", elemento: "Botas", detalle: "Cordones", texto: "Botas - Cordones", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 8, requerido: true, esDeterminante: false, generaNovedad: true },
        { id: "p-epp-9", seccionId: "sec-epp", elemento: "Guantes", detalle: "Tipo Ingeniero", texto: "Guantes - Tipo Ingeniero", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 9, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-epp-10", seccionId: "sec-epp", elemento: "Guantes", detalle: "Tipo Nitrilo", texto: "Guantes - Tipo Nitrilo", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 10, requerido: true, esDeterminante: false, generaNovedad: true },

        // MAQUINA
        { id: "p-maq-1", seccionId: "sec-maquina", elemento: "Frenos", detalle: "Frenos", texto: "Frenos", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 11, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-2", seccionId: "sec-maquina", elemento: "Estado de llantas/Orugas", detalle: "Llantas/Orugas", texto: "Estado de llantas / Orugas", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 12, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-3", seccionId: "sec-maquina", elemento: "Luces", detalle: "Luces", texto: "Luces", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 13, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-4", seccionId: "sec-maquina", elemento: "Pito/señal sonora", detalle: "Alarma sonora", texto: "Pito / Señal sonora", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 14, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-5", seccionId: "sec-maquina", elemento: "Sistema de aireación", detalle: "Aireación / AC", texto: "Sistema de aireación", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 15, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-6", seccionId: "sec-maquina", elemento: "Cinturón de seguridad", detalle: "Cinturón", texto: "Cinturón de seguridad", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 16, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-7", seccionId: "sec-maquina", elemento: "Silla", detalle: "Silla ergonómica", texto: "Silla", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 17, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-8", seccionId: "sec-maquina", elemento: "Chapas", detalle: "Chapas y seguros", texto: "Chapas", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 18, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-maq-9", seccionId: "sec-maquina", elemento: "Fugas", detalle: "Fugas hidráulicas / motor", texto: "Fugas", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 19, requerido: true, esDeterminante: false, generaNovedad: true },
        { id: "p-maq-10", seccionId: "sec-maquina", elemento: "Cámaras de reversa", detalle: "Cámaras", texto: "Cámaras de reversa", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 20, requerido: true, esDeterminante: true, generaNovedad: true },

        // HERRAMIENTAS
        { id: "p-her-1", seccionId: "sec-herramientas", elemento: "Radio Teléfono", detalle: "Comunicación", texto: "Radio Teléfono", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 21, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-her-2", seccionId: "sec-herramientas", elemento: "Kit básico de herramienta", detalle: "Herramientas", texto: "Kit básico de herramienta", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 22, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-her-3", seccionId: "sec-herramientas", elemento: "Extintor", detalle: "Extintor cargado", texto: "Extintor", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 23, requerido: true, esDeterminante: true, generaNovedad: true },
        { id: "p-her-4", seccionId: "sec-herramientas", elemento: "Botiquín", detalle: "Botiquín primeros auxilios", texto: "Botiquín", tipoCampo: "RATING", opciones: RATING_OPCIONES, orden: 24, requerido: true, esDeterminante: true, generaNovedad: true }
    ];

    const nueva = await ListaTemplateModel.create({
        codigo: CODIGO,
        nombre: NOMBRE,
        descripcion: "Información operacional y de seguridad industrial para operadores de Harvester y Forwarder (HV-FW)",
        subprograma: "SEGURIDAD INDUSTRIAL",
        tipoEquipo: "Ambos",
        version: 1,
        activo: true,
        secciones,
        preguntas
    });

    console.log(`✅ Plantilla creada exitosamente: "${NOMBRE}" con ${preguntas.length} preguntas.`);
    return nueva;
};

// Si se ejecuta directamente
if (process.argv[1].endsWith("seedListaHVFW.js")) {
    const mongoUrl = process.env.MONGODB_URL_CTL;
    if (!mongoUrl) {
        console.error("MONGODB_URL_CTL no está definido en .env");
        process.exit(1);
    }
    mongoose.connect(mongoUrl)
        .then(() => seedListaHVFW())
        .then(() => mongoose.disconnect())
        .catch(err => {
            console.error("Error al ejecutar seed:", err);
            process.exit(1);
        });
}
