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
    },
    contratistaId: {
        type: Schema.Types.ObjectId,
        ref: "contratistas",
        require: true
    }
});

export default model("turnos", TurnoSchema);