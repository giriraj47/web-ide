const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: for user auth
    createdAt: { type: Date, default: Date.now },

    // This stores the entire file tree structure as a JSON object
    files: { type: Object, required: true }
});

module.exports = mongoose.model('Project', ProjectSchema);