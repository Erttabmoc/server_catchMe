const mongoose = require("mongoose");

const playerSchema = mongoose.Schema({
  username: { type: String, required: true },
});

module.exports = mongoose.model("User", playerSchema);
