const express = require("express")
const cors = require("cors")
const projectRouter = require("./routes/project.routes")
const authRouter = require("./routes/auth.routes")
const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter)

module.exports = app