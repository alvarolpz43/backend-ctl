import { Schema, model } from "mongoose";

const EquipoSchema = new Schema({
    nombreEquipo: {
        type: String,
        require: true
    },
    serieEquipo: {
        type: String,
        require: true
    },
    contratistaId: {
        type: Schema.Types.ObjectId,
        ref: "contratistas",
        require: true
    }
});

export default model("equipos", EquipoSchema);