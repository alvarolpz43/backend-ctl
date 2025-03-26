import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);


export const registerContratista = z.object({
    nombre: z.string({ required_error: "el nombre de la contratista es requerido" })
})