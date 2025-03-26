import { Schema, model } from "mongoose";

const RegistrosShema = new Schema({

    equipoId: {
        type: Schema.Types.ObjectId,
        ref: "equipos",
        require: true
    },
    operadorId: {
        type: Schema.Types.ObjectId,
        ref: "operadores",
        require: true
    },
    zonaId: {
        type: Schema.Types.ObjectId,
        ref: "zonas",
        require: true
    },
    nucleoId: {
        type: Schema.Types.ObjectId,
        ref: "nucleos",
        require: true
    },
    fincaId: {
        type: Schema.Types.ObjectId,
        ref: "fincas",
        require: true
    },
    contratistaId: {
        type: Schema.Types.ObjectId,
        ref: "contratistas",
        require: true
    },
    especieId: {
        type: Schema.Types.ObjectId,
        ref: "especies",
        require: true
    },
    turnoId: {
        type: Schema.Types.ObjectId,
        ref: "turnos",
        require: true
    },
    fecha: {
        type: Date,
        require: true
    },
    lote: {
        type: String,
        require: true
    },
    pendiente: {
        type: Number
    },
    tProgramado: {
        type: Number,
    },
    tEfectivo: {
        type: Number
    },
    tParadasMecanicas: {
        type: Numeber
    },
    refRepuesto: {
        type: String
    },
    alistamiento: {
        type: Number
    },
    tanqueo: {
        type: Number
    },
    alimentacion: {
        type: Number
    },
    tOtraParada: {
        type: Number
    },
    motivosParada: {
        type: String
    },
    tUsoWinche: {
        type: Number
    },
    novedades: {
        type: String
    },
    suelo: {
        type: String,
        enum: ["nose", "nose"],
        require: true
    },
    horasParada: {
        type: Number
    },
    eficiencia: {
        type: Number
    },
    diametroMedio: {
        type: Number
    },
    productividadM3H: {
        type: Number
    },
    espReparacion: {
        type: String
    },
    reparacion: {
        type: String
    },
    tipoMaquina: {
        type: String,
        enum: ["nose", "nose"],
        require: true
    }



})

export default model("registros", RegistrosShema);