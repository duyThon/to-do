import express from 'express';
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: `http://localhost:${process.env.FE_PORT}`,
    credentials: true
}));



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
