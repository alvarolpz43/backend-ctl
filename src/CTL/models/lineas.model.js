import { Schema, model } from "mongoose";

const LineaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
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
        required: true,
      },
    ],
    forwarders: [
      {
        type: Schema.Types.ObjectId,
        ref: "equipos",
        required: true,
      },
    ],
    fincasDefault: [
      {
        type: Schema.Types.ObjectId,
        ref: "fincas",
      },
    ],
    metaMinimaDefecto: {
      type: Number,
      default: 5000,
      min: 0,
    },
    horasProgramadasDefecto: {
      type: Number,
      default: 0,
      min: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("lineas", LineaSchema);
