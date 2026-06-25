import cors from "cors";
import express from "express";
import { providersRouter } from "./routes/providers.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/providers", providersRouter);
