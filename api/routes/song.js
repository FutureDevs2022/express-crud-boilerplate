const mongoose = require("mongoose");
const express = require('express');
const Joi = require('joi');

// Middlewares
const Auth = require('../middlewares/auth');
const Cryptic = require('../middlewares/cryptic');

// Controllers & Models
const { Create, Read, Update, Delete } = require("../controllers/factory/CRUD");
const model = require("../models/song");

// Constants
const router = express.Router();
const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    isPublished: Joi.boolean(),
    genre: Joi.string().custom((value) => (mongoose.Types.ObjectId.isValid(value))),
    artiste: Joi.string().custom((value) => (mongoose.Types.ObjectId.isValid(value))).required(),
    media: Joi.string().custom((value) => (mongoose.Types.ObjectId.isValid(value))).required(),
    songArt: Joi.array().required(),
})

// ******** CRUD ROUTES ******** //
// create entry
router.post('/', [Auth, Cryptic],
    (req, res) => Create(req, res, {
        model,
        schema
    })
);


// get entry
router.get('/:id',
    (req, res) => Read(req, res, {
        model
    })
);
router.get('/',
    (req, res) => Read(req, res, {
        model
    })
);

// update entry
router.patch('/:id', [Auth, Cryptic],
    (req, res) => Update(req, res, {
        model,
        schema
    })
);

// delete entry
router.delete('/:id', [Auth],
    (req, res) => Delete(req, res, {
        model
    })
);


module.exports = router;