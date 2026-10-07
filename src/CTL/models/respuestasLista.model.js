import { Schema, model } from "mongoose";

const RespuestaCampoSchema = new Schema({
    campoId: { type: String, required: true },
    label: { type: String, default: "" },
    tipo: { type: String, default: "text" },
    valor: { type: Schema.Types.Mixed, default: null },
    limiteMinimo: { type: Number, default: null },
    limiteMaximo: { type: Number, default: null },
    unidadMedida: { type: String, default: "" },
    tablaReferencia: { type: String, default: null }
}, { _id: false });

const RespuestaFormularioSchema = new Schema({
    formularioId: {
        type: Schema.Types.ObjectId,
        ref: "listas_templates",
        required: true
    },
    formularioTituloSnapshot: { type: String, default: "" },
    tipoEquipoSnapshot: { type: String, default: "" },

    equipoId: {
        type: Schema.Types.ObjectId,
        ref: "equipos",
        default: null
    },
    fincaId: {
        type: Schema.Types.ObjectId,
        ref: "fincas",
        default: null
    },
    operadorId: {
        type: Schema.Types.ObjectId,
        ref: "operadores",
        default: null
    },
    usuarioRegistroId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        default: null
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    produccionToneladas: {
        type: Number,
        default: 0
    },

    respuestas: [RespuestaCampoSchema],
    respuestasMap: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

export default model("respuestas_listas", RespuestaFormularioSchema);
