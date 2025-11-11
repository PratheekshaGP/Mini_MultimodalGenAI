import dotenv from "dotenv";
dotenv.config(); // must be first
console.log("DEBUG: env path check =", process.cwd());
console.log("DEBUG: Key value =", process.env.HUGGINGFACE_API_KEY);


import express from "express";
import cors from "cors";
import imageRoutes from "./routes/imageRoutes.js";

const app = express();

// ✅ Check if Hugging Face API key is loaded
console.log("✅ HUGGINGFACE_API_KEY loaded?", !!process.env.HUGGINGFACE_API_KEY);

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/api/images", imageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
