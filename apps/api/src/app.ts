import cors from "cors";
import express from "express";
import { lookupsRouter } from "./routes/lookups.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/lookups", lookupsRouter);
