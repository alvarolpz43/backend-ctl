import { Schema, model } from "mongoose";

const ZonaSchema = new Schema({
    codeZona: {
        type: String,
        require: true
    },
    nombreZona: {
        type: String,
        require: true
    }
});

export default model("zonas", ZonaSchema);