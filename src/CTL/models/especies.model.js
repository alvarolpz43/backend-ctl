import { Schema, model, trusted } from "mongoose";

const EspecieSchema = new Schema({
    nombreEspecie: {
        type: String,
        require: true
    }
});

export default model("especies", EspecieSchema);

