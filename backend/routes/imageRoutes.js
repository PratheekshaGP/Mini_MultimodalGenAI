import express from "express";
import dotenv from "dotenv";
dotenv.config(); // load env in this file too
import fetch from "node-fetch";

console.log("🔍 OpenAI key in imageRoutes.js?", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");

const router = express.Router();

// TEXT → IMAGE
router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "512x512",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error("Unexpected data format from OpenAI:", data);
      return res.status(500).json({ error: "Unexpected data format from OpenAI" });
    }

    res.json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// SKETCH → IMAGE
router.post("/analyze-sketch", async (req, res) => {
  try {
    const { sketchDataUrl } = req.body;
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        image: sketchDataUrl,
        prompt: "Generate a realistic image based on this sketch",
      }),
    });

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error("Unexpected data format from OpenAI:", data);
      return res.status(500).json({ error: "Unexpected data format from OpenAI" });
    }
    res.json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sketch analysis failed" });
  }
});

export default router;
