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
    role: {
        type: Schema.Types.ObjectId,
        ref: "roles"
    },
    todosLosContratistas: {
        type: Boolean,
        default: true
    },
    contratistas: [{
        type: Schema.Types.ObjectId,
        ref: "contratistas"
    }],
},
    {
        timestamps: true
    }
)

export default model("users", UsuarioSchema);