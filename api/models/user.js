const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const globalSchemaProps = require("../constants/globalSchemaProps")

const userSchema = mongoose.Schema({
    ...globalSchemaProps,
    password: {
        type: String,
        required: true,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String },
    phone: { type: String, required: true },
    location: { type: String },
    dob: { type: String, required: true },
    accountType: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccountType' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    cell: { type: mongoose.Schema.Types.ObjectId, ref: 'Cell' },
    newMember: { type: Boolean },
    accountVerified: { type: Boolean, default: false },
});

userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', userSchema);