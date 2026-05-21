const projectModel = require("../models/project.model")

async function getProjectById(req, res) {
    const { id } = req.params
    try {
        const project = await projectModel.findById(id)
        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }
        res.status(200).json(project)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function createProject(req, res) {
    const { title, files } = req.body
    const userId = req.user ? req.user.userId : null;
    try {
        const project = await projectModel.create({ title, userId, files })
        res.status(201).json(project)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function updateProject(req, res) {
    const { id } = req.params
    const { title, files } = req.body
    const userId = req.user ? req.user.userId : null;
    try {
        const projectExists = await projectModel.findById(id)
        if (!projectExists) {
            return res.status(404).json({ message: "No Such project exist" })
        }
        
        // Optionally check if user owns project:
        // if (projectExists.userId && projectExists.userId.toString() !== userId) return res.status(403).json({message: "Unauthorized"})

        const updatedproject = await projectModel.findByIdAndUpdate(id, { title, userId, files }, { new: true })
        res.status(201).json(updatedproject)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function getUserProjects(req, res) {
    try {
        const userId = req.user.userId;
        const projects = await projectModel.find({ userId }).select('title createdAt');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getProjectById, createProject, updateProject, getUserProjects }