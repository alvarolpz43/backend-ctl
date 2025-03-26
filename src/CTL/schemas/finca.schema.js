import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);

export const registerFinca = z.object({
    nombreFinca: z.string({ required_error: "el nombre de la finca es requerido" }),
    codeFinca: z.string({ required_error: "el codigo de la finca es requerido" }),
    nucleoId: z.string({ required_error: "el id del nucleo es requerido" })
}) 