const { encoder } = require("./operations");

const DatabaseStub = require("./DatabaseStub").DatabaseStub;

/**
 * Create Entry
 * @param {*} req 
 * @param {*} res 
 */
module.exports.Create = async (req, res, config) => {
    try {
        const { model, schema } = config;
        const stub = new DatabaseStub(model, schema);
        let data = await stub.create(req.body)
        if (req.headers.datatype == "RAW") {
            data = { output: encoder(data, req.headers.seedphrase) }
        }
        return res.status(200).json(data)
    } catch ({ message }) {
        return res.status(500).json({ message })
    }
}

/**
 * Read Entry
 * @param {*} req 
 * @param {*} res 
 */
module.exports.Read = async (req, res, config) => {
    try {
        const { model } = config;
        const stub = new DatabaseStub(model);
        const id = req.params.id;
        let data = await stub.read(req, id || {})
        if (req.headers.datatype == "RAW") {
            data = { output: encoder(data, req.headers.seedphrase) }
            console.log("RES DATA =>", data);
        }
        return res.status(200).json(data)
    } catch ({ message }) {
        return res.status(500).json({ message })
    }
}

/**
 * Update Entry
 * @param {*} req 
 * @param {*} res 
 */
module.exports.Update = async (req, res, config) => {
    try {
        const { model, schema } = config;
        const stub = new DatabaseStub(model, schema);
        const id = req.params.id;
        let data = await stub.update(id, req.body)
        if (req.headers.datatype == "RAW") {
            data = { output: encoder(data, req.headers.seedphrase) }
        }
        return res.status(200).json(data)
    } catch ({ message }) {
        return res.status(500).json({ message })
    }
}

/**
 * Delete Entry
 * @param {*} req 
 * @param {*} res 
 */
module.exports.Delete = async (req, res, config) => {
    try {
        const { model } = config;
        const stub = new DatabaseStub(model);
        const id = req.params.id;
        const data = await stub.delete(id)
        return res.status(200).json(data)
    } catch ({ message }) {
        return res.status(500).json({ message })
    }
}