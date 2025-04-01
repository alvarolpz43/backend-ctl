import fincaModel from "../models/fincas.model.js";

const findFincaById = async (id) => {
    return await fincaModel.findById(id);
}


const findAllFincas = async () => {
    return await fincaModel.find();
}

const insertFinca = async (data) => {
    const newFinca = new fincaModel(data);
    return newFinca.save();
}



const insertMultipleFincas = async (fincasArray) => {
    try {
        if (!Array.isArray(fincasArray)) {
            throw new Error('Se esperaba un array de fincas');
        }

        const result = await fincaModel.insertMany(fincasArray, {
            ordered: false 
        });

        return {
            insertedCount: result.length,
            insertedIds: result.map(doc => doc._id)
        };
    } catch (error) {
        console.error('Error en insertMultipleFincas:', error);
        throw error;
    }
};





const updateFinca = async (id, data) => {
    return await fincaModel.updateOne(
        { _id: id },
        { $set: data }, 
        {
            runValidators: true, 
            context: 'query' 
        }
    );
};

const findFincaByName = async (name) => {
    return await fincaModel.findOne({ nombreFinca: name });
}

const deletedFinca = async (id) => {
    return await fincaModel.deleteOne({ _id: id });
};

export default {
    findAllFincas,
    findFincaByName,
    findFincaById,
    insertFinca,
    updateFinca,
    deletedFinca,
    insertMultipleFincas
};