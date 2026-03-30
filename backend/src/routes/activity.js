import { Router } from "express";
import { Activity } from "../models.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
