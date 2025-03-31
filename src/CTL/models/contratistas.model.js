import { Schema, model } from "mongoose";
import { boolean } from "zod";

const ContratistaSchema = new Schema({
    nombre: {
        type: String,
        require: true
    },
    estado: {
        type: Boolean,
        defaul: false
    }
});

export default model("contratistas", ContratistaSchema);