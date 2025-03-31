import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);


export const registerEquipo = z.object({
    nombreEquipo: z.string({ required_error: "el nombre del equipo es requerido" }),
    serieEquipo: z.string({ required_error: "la serie del equipo es requerida" }),
    contratistaId: z.string({ required_error: "el id de la contratista es requerido" })
});