import { Schema, model } from "mongoose";

const LineaConfigMesSchema = new Schema(
  {
    lineaId: {
      type: Schema.Types.ObjectId,
      ref: "lineas",
      required: true,
    },
    nombreLinea: {
      type: String,
      required: true,
    },
    contratistaId: {
      type: Schema.Types.ObjectId,
      ref: "contratistas",
      required: true,
    },
    harvesters: [
      {
        type: Schema.Types.ObjectId,
        ref: "equipos",
      },
    ],
    forwarders: [
      {
        type: Schema.Types.ObjectId,
        ref: "equipos",
      },
    ],
    fincas: [
      {
        type: Schema.Types.ObjectId,
        ref: "fincas",
      },
    ],
    metaMinimaToneladas: {
      type: Number,
      default: 5000,
      min: 0,
      required: true,
    },
    horasProgramadas: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const PlaneacionSchema = new Schema(
  {
    nombre: {
      type: String,
      trim: true,
      default: "",
    },
    anio: {
      type: Number,
      required: true,
    },
    mes: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    periodo: {
      type: String,
      required: true,
      unique: true, // "YYYY-MM", ej: "2026-10"
    },
    estado: {
      type: String,
      enum: ["borrador", "activo", "cerrado"],
      default: "activo",
    },
    lineasConfig: [LineaConfigMesSchema],
    notas: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default model("planeaciones", PlaneacionSchema);
