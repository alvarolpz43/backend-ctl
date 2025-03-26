import { Schema, model } from "mongoose";

const FincaSchema = new Schema({
    codeFinca: {
        type: String,
        require: true
    },
    nombreFinca: {
        type: String,
        require: true
    },
    nucleoId: {
        type: Schema.Types.ObjectId,
        ref: "nucleos",
        require: true
    }
});

export default model("fincas", FincaSchema);