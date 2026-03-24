import express from "express";
import { processReview } from "../services/review.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff) {
      return res.status(400).json({ error: "Diff is required" });
    }

    const result = await processReview(diff);

    res.json(result);
  } catch (err) {
    console.error(err);
    console.log(err); // Added for checking ai-code-reviewer PR comment 
    console.log(err); // Added for checking ai-code-reviewer PR comment 
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;