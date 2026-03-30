import { Router } from "express";
import { Task, Activity, AgentStatus } from "../models.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const range = req.query.range || "7d";
    const days = range === "30d" ? 30 : range === "14d" ? 14 : 7;
    const since = new Date(Date.now() - days * 86400000);

    const [totalTasks, completedTasks, inProgressTasks, totalActivities, agents] =
      await Promise.all([
        Task.countDocuments(),
        Task.countDocuments({ status: "done" }),
        Task.countDocuments({ status: "in-progress" }),
        Activity.countDocuments(),
        AgentStatus.find({}),
      ]);

    const dailyData = await Task.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          failed: { $sum: { $cond: [{ $eq: ["$status", "review"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const agentTaskStats = await Task.aggregate([
      { $match: { assigneeId: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$assigneeId",
          tasksCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
          },
          totalTasks: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        totalActivities,
        agentsOnline: agents.filter(
          (a) =>
            a.status !== "idle" ||
            Date.now() - new Date(a.lastSeen).getTime() < 300000
        ).length,
        totalAgents: agents.length,
      },
      dailyData,
      agentTaskStats,
      agents: agents.map((a) => a.toObject()),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
