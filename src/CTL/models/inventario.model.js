import { Schema, model } from "mongoose";

const InventarioSchema = new Schema(
  {
    grupoEnvioId: {
      type: String,
      required: true,
      index: true,
    },
    fecha: {
      type: Date,
      required: true,
      index: true,
    },
    mes: {
      type: String,
      required: true,
      trim: true,
    },
    codigoMes: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    zonaId: {
      type: Schema.Types.ObjectId,
      ref: "zonas",
      required: true,
    },
    contratistaId: {
      type: Schema.Types.ObjectId,
      ref: "contratistas",
      required: true,
      index: true,
    },
    fincaId: {
      type: Schema.Types.ObjectId,
      ref: "fincas",
      required: true,
    },
    lote: {
      type: String,
      required: true,
      trim: true,
    },
    equipoId: {
      type: Schema.Types.ObjectId,
      ref: "equipos",
      required: true,
      index: true,
    },
    sistema: {
      type: String,
      required: true,
      trim: true,
    },
    tipoFibra: {
      type: String,
      required: true,
      trim: true,
    },
    producto: {
      type: String,
      required: true,
      enum: ["Pulpa", "Aserrio", "Biomasa"],
      index: true,
    },
    invCampo: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    invTransito: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    invViaFinca: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalInventario: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    observaciones: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("inventarios", InventarioSchema);
