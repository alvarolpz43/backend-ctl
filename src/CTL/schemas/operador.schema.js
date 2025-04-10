import z from "zod";

import mongoose from "mongoose";

const isValid = (value) => mongoose.Types.ObjectId.isValid(value);

export const registerOperador = z.object({
    numCedula: z.string({ required_error: "el numero de cedula es requerido" }),
    nameOperador: z.string({ required_error: "el nombre del operador es requerido" }),
    equipoId: z.string({ required_error: "el id del equipo es requerido " }),
}) 