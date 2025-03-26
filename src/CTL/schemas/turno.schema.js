import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);

export const registerTurno = z.object({
    nombreTurno: z.string({ required_error: "el nombre del turno es requerido" }),
    horaInicio: z.string({ required_error: "la hora de inicio es requerida" }),
    horaFin: z.string({ required_error: "la hora de finalizacion es requerida" })
})  