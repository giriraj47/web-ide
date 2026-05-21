const app = require("./src/app");
const mongoose = require("mongoose");
require("dotenv").config()



mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });