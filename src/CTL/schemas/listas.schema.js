import z from "zod";

const campoFormularioSchema = z.object({
    id: z.string({ required_error: "El id del campo es requerido" }),
    seccionId: z.string().optional().default("default"),
    label: z.string({ required_error: "La etiqueta o pregunta es requerida" }),
    tipo: z.enum([
        "text", "textarea", "number", "radio", "checkbox", "select", "cascading_select", "equipo_select", "tabla_referencia", "boolean", "date", "datetime-local", "datetime", "time", "photo", "array_paradas", "array"
    ]).default("text"),
    placeholder: z.string().optional().default(""),
    descripcion: z.string().optional().default(""),
    required: z.boolean().optional().default(false),
    isDefaultEquipo: z.boolean().optional().default(false),
    opciones: z.array(z.any()).optional().default([]),
    jerarquia: z.any().optional().nullable(),
    niveles: z.array(z.string()).optional().default([]),
    limiteMinimo: z.number().nullable().optional(),
    limiteMaximo: z.number().nullable().optional(),
    unidadMedida: z.string().optional().default(""),
    tablaReferencia: z.string().nullable().optional(),
    condicion: z.any().optional().nullable(),
    orden: z.number().optional().default(0)
});

const seccionFormularioSchema = z.object({
    id: z.string({ required_error: "El id de la sección es requerido" }),
    titulo: z.string({ required_error: "El título de la sección es requerido" }),
    descripcion: z.string().optional().default(""),
    orden: z.number().optional().default(0)
});

export const listaTemplateSchema = z.object({
    titulo: z.string().min(2, "El título del formulario debe tener al menos 2 caracteres").optional(),
    nombre: z.string().min(2, "El título debe tener al menos 2 caracteres").optional(),
    descripcion: z.string().optional().default(""),
    tipoEquipo: z.string({
        required_error: "El tipo de equipo al que va vinculado el formulario es obligatorio"
    }).default("General"),
    activo: z.boolean().optional().default(true),
    secciones: z.array(seccionFormularioSchema).optional().default([]),
    campos: z.array(campoFormularioSchema).optional().default([]),
    preguntas: z.array(z.any()).optional()
}).refine(data => data.titulo || data.nombre, {
    message: "El título del formulario es obligatorio",
    path: ["titulo"]
});

export const registrarRespuestaSchema = z.object({
    formularioId: z.string().optional(),
    listaTemplateId: z.string().optional(),
    equipoId: z.string().nullable().optional(),
    operadorId: z.string().nullable().optional(),
    fecha: z.string().optional(),
    respuestas: z.union([
        z.array(z.object({
            campoId: z.string(),
            label: z.string().optional(),
            tipo: z.string().optional(),
            valor: z.any(),
            limiteMinimo: z.number().nullable().optional(),
            limiteMaximo: z.number().nullable().optional(),
            unidadMedida: z.string().optional(),
            tablaReferencia: z.string().nullable().optional()
        })),
        z.record(z.any())
    ])
});
