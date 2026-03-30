import express from "express";
import dotenv from "dotenv";
import reviewController from "./controllers/review.controller.js";
import githubController from "./controllers/github.controller.js";
import { initVectorDB } from "./services/db/vector.service.js";

dotenv.config();

const app = express();
app.use(express.json());

await initVectorDB();

app.use("/review", reviewController);
app.use("/review/github", githubController);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});