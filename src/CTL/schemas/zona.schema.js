import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);

export const registerZona = z.object({
    nombreZona: z.string({ required_error: "el nombre de la zona es requerido" }),
    codeZona: z.string({ required_error: "el codigo de la zona es requerido" })
}) 