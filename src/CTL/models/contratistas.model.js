import { Schema, model } from "mongoose";

const ContratistaSchema = new Schema({
    nombre: {
        type: String,
        require: true
    }
});

export default model("contratistas", ContratistaSchema);