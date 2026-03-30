import { Router } from "express";
import { Message } from "../models.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const channel = req.query.channel || "general";
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ channel })
      .sort({ createdAt: 1 })
      .limit(limit);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
