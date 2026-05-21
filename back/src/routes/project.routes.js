const express = require("express")
const { getProjectById, createProject, updateProject, getUserProjects } = require("../controllers/project.controller")
const { authMiddleware } = require("../middleware/auth.middleware")

const projectRouter = express.Router();

projectRouter.get("/", authMiddleware, getUserProjects)
projectRouter.get("/:id", getProjectById)
projectRouter.post("/", authMiddleware, createProject)
projectRouter.put("/:id", authMiddleware, updateProject)


module.exports = projectRouter