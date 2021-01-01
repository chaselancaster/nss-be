const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StreamerSchema = new mongoose.Schema({
    name: { type: String },
    score: { type: Number, default: 0 }
});

module.exports = mongoose.model("Streamer", StreamerSchema);