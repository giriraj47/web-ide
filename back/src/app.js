const express = require("express")
const cors = require("cors")
const projectRouter = require("./routes/project.routes")
const authRouter = require("./routes/auth.routes")
const app = express()

const allowedOrigins = [
    'http://localhost:5173',
    'https://web-ide-gamma.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, postman, or curl)
        if(!origin) return callback(null, true);
        
        // Remove trailing slash if present for comparison
        const normalizedOrigin = origin.replace(/\/$/, '');
        if(allowedOrigins.map(o => o.replace(/\/$/, '')).indexOf(normalizedOrigin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter)

module.exports = app