import express from "express";
import { addPoints } from "./webhook.routes.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/webhook", addPoints);

export default app;
