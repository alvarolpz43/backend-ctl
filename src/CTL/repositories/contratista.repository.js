
import contratistasModel from "../models/contratistas.model.js";
import equiposModel from "../models/equipos.model.js";
import turnosModel from "../models/turnos.model.js";

const findContratistaById = async (id) => {
    return await contratistasModel.findById(id);
}


const findAllContratistas = async () => {
    return await contratistasModel.aggregate([
        {
            $lookup: {
                from: "equipos",
                localField: "_id",
                foreignField: "contratistaId",
                as: "equipos"
            }
        },
        {
            $lookup: {
                from: "operadores",
                localField: "equipos._id",
                foreignField: "equipoId",
                as: "operadores"
            }
        },
        {
            $lookup: {
                from: "turnos",
                localField: "_id",
                foreignField: "contratistaId",
                as: "turnos"
            }
        },
        {
            $addFields: {
                totalEquipos: { $size: "$equipos" },
                totalTurnos: { $size: "$turnos" },
                totalOperadores: { $size: "$operadores" }
            }
        },
        {
            $project: {
                equipos: 0,
                turnos: 0,
                operadores: 0
            }
        }
    ]);
};

const insertContratista = async (data) => {
    const newContratista = new contratistasModel(data);
    return newContratista.save();
}

const updateContratista = async (id, data) => {
    return await contratistasModel.updateOne(
        { _id: id },
        { $set: data },
        { runValidators: true } // Asegura que se ejecuten las validaciones del schema
    );
};

const findContratistaByName = async (name) => {
    return await contratistasModel.findOne({ nombre: name });
}
const deleteContratista = async (id) => {
    await turnosModel.deleteMany({ contratistaId: id });
    await equiposModel.deleteMany({ contratistaId: id });
    return await contratistasModel.deleteOne({ _id: id });
};

export default {
    findAllContratistas,
    findContratistaById,
    insertContratista,
    updateContratista,
    findContratistaByName,
    deleteContratista
};