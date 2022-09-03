const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const globalSchemaProps = require("../constants/globalSchemaProps");

const schema = mongoose.Schema({
  ...globalSchemaProps,
  title: { type: String, required: true },
  description: { type: String, required: true },
  artiste: { type: mongoose.Schema.Types.ObjectId, ref: 'Artiste', required: true },
  media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
  songArt: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true }],
  isPublished: { type: Boolean },
});
schema.plugin(mongoosePaginate);
module.exports = mongoose.model("Song", schema);
