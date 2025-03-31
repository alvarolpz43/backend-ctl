import { Schema, model } from "mongoose";

const OperadorSchema = new Schema({
    numCedula: {
        type: String,
        require: true
    },
    nameOperador: {
        type: String,
        require: true
    },
    equipoId: {
        type: Schema.Types.ObjectId,
        ref: "equipos",
        require: true
    }
});

export default model("operadores", OperadorSchema);