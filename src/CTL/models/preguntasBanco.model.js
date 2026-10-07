import { Schema, model } from "mongoose";

const PreguntaBancoSchema = new Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        enum: ["radio", "select", "checkbox", "cascading_select"],
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
