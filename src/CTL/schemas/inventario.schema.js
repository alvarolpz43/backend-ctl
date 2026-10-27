import { z } from "zod";
import mongoose from "mongoose";

const objectIdValidator = (val) => mongoose.Types.ObjectId.isValid(val);

const productoItemSchema = z.object({
  producto: z.enum(["Pulpa", "Aserrio", "Biomasa"], {
    required_error: "El producto debe ser Pulpa, Aserrio o Biomasa",
  }),
  invCampo: z.coerce.number().min(0, "Inv. Campo debe ser mayor o igual a 0").default(0),
  invTransito: z.coerce.number().min(0, "Inv. Tránsito debe ser mayor o igual a 0").default(0),
  invViaFinca: z.coerce.number().min(0, "Inv. en Vía/Finca debe ser mayor o igual a 0").default(0),
});

export const registrarInventarioSchema = z.object({
  fecha: z.string({ required_error: "La fecha es requerida" }),
  mes: z.string({ required_error: "El mes es requerido" }).min(1),
  codigoMes: z.string({ required_error: "El código de mes es requerido" }).min(1),
  zonaId: z.string({ required_error: "La zona es requerida" }).refine(objectIdValidator, {
    message: "ID de zona inválido",
  }),
  contratistaId: z.string({ required_error: "El contratista es requerido" }).refine(objectIdValidator, {
    message: "ID de contratista inválido",
  }),
  fincaId: z.string({ required_error: "La finca es requerida" }).refine(objectIdValidator, {
    message: "ID de finca inválido",
  }),
  lote: z.string({ required_error: "El lote es requerido" }).min(1, "El lote no puede estar vacío"),
  equipoId: z.string({ required_error: "El equipo es requerido" }).refine(objectIdValidator, {
    message: "ID de equipo inválido",
  }),
  sistema: z.string({ required_error: "El sistema de cosecha es requerido" }).min(1),
  tipoFibra: z.string({ required_error: "El tipo de fibra es requerido" }).min(1),
  productos: z
    .array(productoItemSchema)
    .min(1, "Debe seleccionar al menos un producto (Pulpa, Aserrío o Biomasa)"),
  observaciones: z.string().optional().default(""),
});

export const actualizarInventarioSchema = z.object({
  fecha: z.string().optional(),
  mes: z.string().optional(),
  codigoMes: z.string().optional(),
  zonaId: z.string().refine(objectIdValidator).optional(),
  contratistaId: z.string().refine(objectIdValidator).optional(),
  fincaId: z.string().refine(objectIdValidator).optional(),
  lote: z.string().min(1).optional(),
  equipoId: z.string().refine(objectIdValidator).optional(),
  sistema: z.string().min(1).optional(),
  tipoFibra: z.string().min(1).optional(),
  producto: z.enum(["Pulpa", "Aserrio", "Biomasa"]).optional(),
  invCampo: z.coerce.number().min(0).optional(),
  invTransito: z.coerce.number().min(0).optional(),
  invViaFinca: z.coerce.number().min(0).optional(),
  observaciones: z.string().optional(),
});
