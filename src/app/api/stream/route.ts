import { connectDB } from "@/lib/mongodb";
import { AgentStatus, Task, Activity, Message } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      // Send keepalive immediately
      send("connected", { ts: Date.now() });

      const poll = async () => {
        if (closed) return;
        try {
          const [agents, tasks, activities, messages] = await Promise.all([
            AgentStatus.find({}).sort({ agentId: 1 }).lean(),
            Task.find({}).sort({ createdAt: -1 }).limit(100).lean(),
            Activity.find({}).sort({ createdAt: -1 }).limit(50).lean(),
            Message.find({ channel: "general" })
              .sort({ createdAt: 1 })
              .limit(50)
              .lean(),
          ]);

          const agentsOnline = agents.filter(
            (a) =>
              a.status !== "idle" ||
              Date.now() - new Date(a.lastSeen as string).getTime() < 300000
          ).length;

          send("agents", agents);
          send("tasks", tasks);
          send("activities", activities);
          send("messages", messages);
          send("stats", {
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t) => t.status === "done").length,
            inProgressTasks: tasks.filter((t) => t.status === "in-progress")
              .length,
            agentsOnline,
            totalAgents: agents.length,
          });
        } catch (err) {
          send("error", { message: String(err) });
        }
      };

      // Initial burst
      await poll();

      // Then every 2s
      const interval = setInterval(poll, 2000);

      // Cleanup when client disconnects
      const cleanup = () => {
        closed = true;
        clearInterval(interval);
      };

      // Store cleanup for cancel
      (controller as unknown as { _cleanup: () => void })._cleanup = cleanup;
    },
    cancel(controller) {
      const c = controller as unknown as { _cleanup?: () => void };
      c._cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
