const cloudinary = require('cloudinary').v2
const Media = require("../models/media");
const Comment = require("../models/comment");
const { DatabaseStub } = require("./factory/DatabaseStub");
const { Create } = require("./factory/CRUD");
const { OTP_GEN } = require("./factory/operations");
const _ = require("lodash");
const moment = require("moment")

// Configure your cloud name, API key and API secret:
module.exports.cloudinaryConfig = cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

// Server-side function used to sign an Upload Widget upload.
module.exports.signUploadWidget = (req, res) => {
    try {
        const { api_secret, api_key, cloud_name } = cloudinary.config();
        const timestamp = Math.round((new Date).getTime() / 1000);
    
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            source: 'uw',
            folder: 'signed_upload_demo_uw'
        }, api_secret);
    
        res.status(200).json({ timestamp, signature, api_key, cloud_name })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports.uploadMedia = async (req, res, params) => {
    try {
        const { schema } = params;
        await Create(req, res, {
            model: Media,
            schema
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
