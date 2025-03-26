import { Schema, model } from "mongoose";

const TurnoSchema = new Schema({
    nombreTurno: {
        type: String,
        require: true
    },
    horaInicio: {
        type: Date,

    },
    horaFin: {
        type: Date,
    }
});

export default model("turnos", TurnoSchema);