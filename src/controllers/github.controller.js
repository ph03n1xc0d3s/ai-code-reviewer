import express from "express";
import { handlePR } from "../services/github.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const event = req.headers["x-github-event"];

    if (event === "pull_request") {
      await handlePR(req.body);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});



export default router;