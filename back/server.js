const app = require("./src/app");
const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://giri:IgzHtNty8BSMkEF2@yt-complete-backend.qxwrqyv.mongodb.net/zack";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });