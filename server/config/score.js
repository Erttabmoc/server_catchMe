const mongoose = require("mongoose");

const playerSchema = mongoose.Schema({
  pseudoname: { type: String, required: true },
  score: { type: Number, required: true },
});

module.exports = mongoose.model("Score", playerSchema);
