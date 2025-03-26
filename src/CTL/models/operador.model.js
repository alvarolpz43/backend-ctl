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
    contratistaId: {
        type: Schema.Types.ObjectId,
        ref: "contratistas",
        require: true
    }
});

export default model("operadores", OperadorSchema);