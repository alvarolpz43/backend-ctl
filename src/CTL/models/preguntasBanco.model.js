import { Schema, model } from "mongoose";

const PreguntaBancoSchema = new Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        enum: ["radio", "select", "checkbox", "cascading_select", "number", "tabla_referencia", "array_paradas", "array"],
        default: "radio"
    },
    opciones: [{
        type: Schema.Types.Mixed,
        required: true
    }],
    jerarquia: {
        type: Schema.Types.Mixed,
        default: null
    },
    niveles: [{
        type: String
    }],
    limiteMinimo: {
        type: Number,
        default: null
    },
    limiteMaximo: {
        type: Number,
        default: null
    },
    unidadMedida: {
        type: String,
        default: ""
    },
    tablaReferencia: {
        type: String,
        default: null
    },
    categoria: {
        type: String,
        default: "General",
        trim: true
    },
    descripcion: {
        type: String,
        default: "",
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default model("preguntas_banco", PreguntaBancoSchema);
