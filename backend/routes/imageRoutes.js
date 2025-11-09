import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`,
        "Accept": "application/json",
        // This API requires multipart/form-data instead of JSON:
      },
      body: new URLSearchParams({
        prompt: prompt || "A beautiful landscape with mountains and river"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("API Error:", errText);
      return res.status(500).json({ error: "Failed to generate image", details: errText });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
