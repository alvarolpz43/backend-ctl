import { Schema, model } from "mongoose";

const EquipoSchema = new Schema({
    nombreEquipo: {
        type: String,
        require: true
    },
    serieEquipo: {
        type: String,
        require: true
    }
});

export default model("equipos", EquipoSchema);