import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todo.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;
const FE_PORT = process.env.FE_PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: `http://localhost:${FE_PORT}`,
    credentials: true
}));

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    })

app.use('/api/auth', authRoutes);
app.use('/api/todo', todoRoutes);

app.get('/', (req, res) => {
    res.send("Backend is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
