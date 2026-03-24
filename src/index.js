import express from "express";
import dotenv from "dotenv";
import reviewController from "./controllers/review.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/review", reviewController);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});