import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);

export const registerNucleo = z.object({
    nombreNucleo: z.string({ required_error: "el nombre del nucleo es requerido" }),
    codeNucleo: z.string({ required_error: "el codigo del nucleo es requerido" }),
    zonaId: z.string({ required_error: "el id de la zona es requerido" })
}) 