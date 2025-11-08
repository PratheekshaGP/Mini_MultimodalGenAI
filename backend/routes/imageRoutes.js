import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TEXT → IMAGE
router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "auto",
    });

    const imageUrl = result.data[0].url;
    res.json({ imageUrl });
  } catch (err) {
    console.error("❌ Error generating image:", err);
    res.status(500).json({ error: err.message || "Image generation failed" });
  }
});

// SKETCH → IMAGE (optional later)
router.post("/analyze-sketch", async (req, res) => {
  try {
    const { sketchDataUrl } = req.body;

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: sketchDataUrl,
      prompt: "Generate a realistic image based on this sketch",
    });

    const imageUrl = result.data[0].url;
    res.json({ imageUrl });
  } catch (err) {
    console.error("❌ Sketch edit failed:", err);
    res.status(500).json({ error: err.message || "Sketch analysis failed" });
  }
});

export default router;
