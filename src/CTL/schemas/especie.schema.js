import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);

export const registerEspecie = z.object({
    nombreEspecie: z.string({required_error: "el nombre de la especie es requerido"})
})