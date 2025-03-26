import { Schema, model } from "mongoose";

const NucleoSchema = new Schema({
    codeNucleo: {
        type: String,
        require: true
    },
    nombreNucleo: {
        type: String,
        require: true
    }
    ,
    zonaId: {
        type: Schema.Types.ObjectId,
        ref: "zonas",
        require: true
    }
});

export default model("nucleos", NucleoSchema);