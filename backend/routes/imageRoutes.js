import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// 🎨 Text-to-Image route
router.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    console.log("🧠 Generating image for prompt:", prompt);

    const response = await fetch("https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Hugging Face API Error:", error);
      return res.status(500).json({ error: "Failed to generate image" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.json({ imageUrl });
  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
