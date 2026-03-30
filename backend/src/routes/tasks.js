import { Router } from "express";
import { Task } from "../models.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { status, assignee } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
