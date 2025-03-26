import { Schema, model } from "mongoose";

const UsuarioSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        match: /.+\@.+\..+/
    },
    password: {
        type: String,
        require: true
    },

},
    {
        timestamps: true
    }
)

export default model("users", UsuarioSchema);