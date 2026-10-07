import { Schema, model } from "mongoose";

const SeccionFormularioSchema = new Schema({
    id: { type: String, required: true },
    titulo: { type: String, required: true, default: "Sección" },
    descripcion: { type: String, default: "" },
    orden: { type: Number, required: true, default: 0 }
}, { _id: false });

const CampoFormularioSchema = new Schema({
    id: { type: String, required: true },
    seccionId: { type: String, default: "default" },
    label: { type: String, required: true },
    tipo: {
        type: String,
        required: true,
        enum: ["text", "textarea", "number", "radio", "checkbox", "select", "cascading_select", "equipo_select", "tabla_referencia", "boolean", "date", "time", "photo"],
        default: "text"
    },
    placeholder: { type: String, default: "" },
    descripcion: { type: String, default: "" },
    required: { type: Boolean, default: false },
    isDefaultEquipo: { type: Boolean, default: false },
    opciones: [{ type: Schema.Types.Mixed }],
    jerarquia: { type: Schema.Types.Mixed, default: null },
    niveles: [{ type: String }],
    limiteMinimo: { type: Number, default: null },
    limiteMaximo: { type: Number, default: null },
    unidadMedida: { type: String, default: "" },
    tablaReferencia: { type: String, default: null },
    orden: { type: Number, required: true, default: 0 }
}, { _id: false });

const FormularioOperacionalSchema = new Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    tipoEquipo: {
        type: String,
        required: true,
        default: "General",
        trim: true
    },
    version: { type: Number, default: 1 },
    activo: { type: Boolean, default: true },
    secciones: [SeccionFormularioSchema],
    campos: [CampoFormularioSchema]
}, { timestamps: true });

// Compatibilidad con frontend/backend previo si busca nombre o preguntas
FormularioOperacionalSchema.virtual("nombre").get(function () {
    return this.titulo;
});
FormularioOperacionalSchema.virtual("preguntas").get(function () {
    return this.campos;
});

FormularioOperacionalSchema.set("toJSON", { virtuals: true });
FormularioOperacionalSchema.set("toObject", { virtuals: true });

export default model("listas_templates", FormularioOperacionalSchema);
