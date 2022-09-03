const mongoose = require("mongoose");
const _ = require("lodash");

const { genQueryParams } = require("./operations");

module.exports.DatabaseStub = class {
    /**
     * 
     * @param {*} model Expects a mongoose model
     * @param {*} schema (Optional) Expects a Joi schema for validation
     */
    constructor(model, schema) {
        this.model = model;
        this.schema = schema
    }

    /**
     * Creates an entry in the database with the given payload
     * @param {object} payload 
     * @returns {object} resolves a Promise
     */
    create(payload) {
        return new Promise((resolve, reject) => {
            try {
                if (this.schema) {
                    // validate payload
                    const { error } = this.schema.validate(payload);
                    if (error) return reject(error)
                }
                const entry = new this.model({
                    _id: new mongoose.Types.ObjectId(),
                    ...payload
                });
                entry.save().then((entry) => {
                    resolve({ message: "Entry created successfully", entry })
                }).catch(error => {
                    reject(error)
                });
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Use this method to fetch single as well as paginated records
     * @param {*} req 
     * @param {*} _query 
     * @returns resolves a Promise
     */
    read(req, _query) {
        return new Promise((resolve, reject) => {
            try {
                genQueryParams(
                    'data',
                    _.isObject(_query) ? _query : { _id: _query },
                    req,
                    (results) => {
                        const { query, options } = results;
                        this.model.paginate(query, options).then(entries => {
                            if (!_.isObject(_query)) {
                                if (_.isEmpty(entries["data"])) {
                                    return reject(new Error("Record not found, please try a different ID"))
                                }
                                resolve(entries["data"][0])
                            } else {
                                resolve(entries);
                            }
                        }).catch(error => {
                            reject(error);
                        })
                    })
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * This method updates a single record
     * @param {*} id 
     * @param {*} payload 
     * @returns 
     */
    update(id, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!id) return reject(new Error("Please provide a document ID"))
                if (!payload) return reject(new Error("Please provide some data to update"))
                if (this.schema) {
                    // validate payload
                    const { error } = this.schema.validate(payload);
                    if (error) return reject(error)
                }
                const updateOps = {};
                const originalObject = await this.model.findById(id);
                if (!originalObject) return reject(new Error("We were unable to find the requested document"))
                // dynamically generate an object with only the properties that
                // were passed for updating the user
                _.forEach(payload, function (val, index) {
                    updateOps[index] = val
                })
                this.model.updateOne({ _id: id }, {
                    $set: {
                        ...updateOps,
                        __v: originalObject["__v"] + 1
                    }
                }).then(() => {
                    resolve({ message: "Entry updated successfully", entry: payload })
                }).catch(error => {
                    reject(error)
                });
            } catch (error) {
                reject(error)
            }
        })
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            try {
                this.model.remove({ _id: id }).exec().then(() => {
                    resolve({ message: "Entry deleted successfully" })
                }).catch(error => {
                    res.status(500).json({ message: error })
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}