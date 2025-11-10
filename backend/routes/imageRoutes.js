import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  console.log("🎨 Generating image for prompt:", prompt);

  try {
    // Step 1️⃣: Start prediction job
    const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  version: "a9758cbfbd291c90bfa2acb264e1c870567fafcf8d2b02f3b7c0b249a2aa0a4f", // ✅ public Stable Diffusion 1.5
  input: {
    prompt,
    width: 512,
    height: 512,
  },
}),

    });

    const prediction = await startResponse.json();
    console.log("🧩 API Response:", prediction); // 👈 This will show us what Replicate returns

    if (!prediction || !prediction.id) {
      console.error("❌ Invalid prediction response:", prediction);
      return res.status(400).json({
        error: prediction?.detail || "Invalid response from Replicate API",
      });
    }

    console.log("🕓 Prediction started:", prediction.id);

    // Step 2️⃣: Poll the prediction until it’s complete
    let finalResult = prediction;
    while (finalResult.status !== "succeeded" && finalResult.status !== "failed") {
      await new Promise((r) => setTimeout(r, 2000)); // wait 2s
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      finalResult = await pollResponse.json();
      console.log("⏳ Status:", finalResult.status);
    }

    // Step 3️⃣: Return the final image
    if (finalResult.status === "succeeded") {
      console.log("✅ Image generated successfully!");
      res.json({ imageUrl: finalResult.output[0] });
    } else {
      console.error("❌ Generation failed:", finalResult.error);
      res.status(400).json({ error: finalResult.error });
    }
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
