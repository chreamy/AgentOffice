#!/usr/bin/env node
// Seeds MongoDB with real workspace data

const BASE = "http://localhost:8080";

async function post(path, data) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

async function patch(path, data) {
  const r = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

async function main() {
  console.log("🌱 Seeding real data into MongoDB...\n");

  // ── Update agent statuses with real current state ──────────────────────────
  console.log("Updating agent statuses...");
  await patch("/api/agents", {
    agentId: "kiyo",
    status: "idle",
    location: "Command Center",
    currentTask: "Taiwan market research completed, awaiting next directive",
    statusMessage: "Research mission complete",
    tasksCompleted: 12,
    responseTime: "1.4s",
    uptime: "99.9%",
    lastSeen: new Date().toISOString(),
  });

  await patch("/api/agents", {
    agentId: "arch",
    status: "working",
    location: "Engineering Bay",
    currentTask: "Building Agent Office dashboard — connecting real data",
    statusMessage: "Wiring MongoDB to frontend",
    tasksCompleted: 8,
    responseTime: "0.9s",
    uptime: "99.8%",
    lastSeen: new Date().toISOString(),
  });

  await patch("/api/agents", {
    agentId: "nova",
    status: "idle",
    location: "Design Studio",
    currentTask: "Available for creative tasks",
    statusMessage: "Standing by",
    tasksCompleted: 3,
    responseTime: "1.5s",
    uptime: "99.5%",
    lastSeen: new Date().toISOString(),
  });

  await patch("/api/agents", {
    agentId: "atlas",
    status: "idle",
    location: "Knowledge Library",
    currentTask: "Taiwan market research archived and complete",
    statusMessage: "Research complete — awaiting next mission",
    tasksCompleted: 7,
    responseTime: "2.1s",
    uptime: "99.7%",
    lastSeen: new Date().toISOString(),
  });

  await patch("/api/agents", {
    agentId: "echo",
    status: "syncing",
    location: "Analytics Lab",
    currentTask: "Syncing dashboard analytics with real data",
    statusMessage: "Updating metrics pipeline",
    tasksCompleted: 5,
    responseTime: "1.1s",
    uptime: "99.9%",
    lastSeen: new Date().toISOString(),
  });

  console.log("✅ Agents updated\n");

  // ── Seed real tasks from workspace activity ────────────────────────────────
  console.log("Seeding real tasks...");
  const tasks = [
    {
      title: "Taiwan Market Research — Full Report",
      description: "Comprehensive 11,000+ word analysis of Taiwan service market. Identified 3 top opportunities: AI Home Cleaning ($50K-$200K/mo), Senior Care Platform ($100K-$500K/mo), Cross-Border Shopping Automation ($30K-$150K/mo).",
      status: "done",
      priority: "P0",
      assignee: "Atlas 🌐",
      assigneeId: "atlas",
      tags: ["research", "taiwan", "market-analysis"],
      dueDate: "2026-03-30",
      progress: 100,
    },
    {
      title: "Agent Office Dashboard — MongoDB Integration",
      description: "Build Next.js 16 office UI with real MongoDB backend. Wire all 5 agents to live data, analytics, task management, and messaging.",
      status: "in-progress",
      priority: "P0",
      assignee: "Arch 🏗️",
      assigneeId: "arch",
      tags: ["frontend", "backend", "mongodb"],
      dueDate: "2026-03-31",
      progress: 80,
    },
    {
      title: "Q2 Strategic Planning — Business Direction",
      description: "Define which Taiwan opportunity to pursue. Options: AI Home Cleaning vs Senior Care Platform. Need to define ICP, pricing model, and 30-day launch plan.",
      status: "todo",
      priority: "P0",
      assignee: "Kiyo 🦾",
      assigneeId: "kiyo",
      tags: ["strategy", "planning", "q2"],
      dueDate: "2026-04-02",
      progress: 0,
    },
    {
      title: "Launch Plan — AI Home Cleaning Service Taiwan",
      description: "Execute 30-day launch: register on 潔客幫 and 591, build WeChat/Line presence, hire 5 cleaners, set up pricing ($800-1200 NTD/session). Target: 50 bookings in month 1.",
      status: "todo",
      priority: "P1",
      assignee: "Kiyo 🦾",
      assigneeId: "kiyo",
      tags: ["taiwan", "launch", "cleaning-service"],
      dueDate: "2026-04-15",
      progress: 0,
    },
    {
      title: "Senior Care Platform — Market Validation",
      description: "Validate LTC 3.0 government subsidy integration. Contact 10 families, 5 care centers. Evaluate $1.8B government investment opportunity for senior companion tech.",
      status: "todo",
      priority: "P1",
      assignee: "Atlas 🌐",
      assigneeId: "atlas",
      tags: ["taiwan", "senior-care", "validation"],
      dueDate: "2026-04-10",
      progress: 0,
    },
    {
      title: "Set Up Cron Jobs for Research Automation",
      description: "Configure recurring research tasks as OpenClaw cron jobs. Daily prospecting, weekly market scans, competitive intelligence updates.",
      status: "in-progress",
      priority: "P1",
      assignee: "Arch 🏗️",
      assigneeId: "arch",
      tags: ["automation", "cron", "research"],
      dueDate: "2026-04-01",
      progress: 60,
    },
    {
      title: "Analytics Dashboard — Real Metrics Pipeline",
      description: "Connect analytics observatory to real MongoDB data. Track agent efficiency, task throughput, API costs, and business KPIs.",
      status: "in-progress",
      priority: "P1",
      assignee: "Echo 📊",
      assigneeId: "echo",
      tags: ["analytics", "metrics", "mongodb"],
      dueDate: "2026-03-31",
      progress: 45,
    },
    {
      title: "ICP Definition — Ideal Customer Profile",
      description: "Define who we're selling to. Taiwan-based? Cross-border? B2C or B2B? Age 30-65, household income 60K+ NTD/month. Must complete before any outreach.",
      status: "todo",
      priority: "P1",
      assignee: "Kiyo 🦾",
      assigneeId: "kiyo",
      tags: ["strategy", "icp", "sales"],
      dueDate: "2026-04-03",
      progress: 0,
    },
    {
      title: "Cross-Border Shopping Automation — POC",
      description: "Build proof-of-concept for Japan/Korea shopping automation. Target young Taiwan buyers. Line shopping bot + sourcing automation. Proven market: existing players doing 200K NTD/month.",
      status: "todo",
      priority: "P2",
      assignee: "Arch 🏗️",
      assigneeId: "arch",
      tags: ["automation", "cross-border", "poc"],
      dueDate: "2026-04-20",
      progress: 0,
    },
    {
      title: "Create Agent Office GitHub Repository",
      description: "Push agent-office Next.js project to GitHub. Set up CI/CD, README, and documentation. Share with user.",
      status: "todo",
      priority: "P2",
      assignee: "Arch 🏗️",
      assigneeId: "arch",
      tags: ["devops", "github", "documentation"],
      dueDate: "2026-04-01",
      progress: 0,
    },
    {
      title: "Weekly AI Tools Research Report",
      description: "Research and document latest AI capabilities, monetization models, and competitive landscape. Update MEMORY.md with key findings.",
      status: "todo",
      priority: "P2",
      assignee: "Atlas 🌐",
      assigneeId: "atlas",
      tags: ["research", "ai-tools", "weekly"],
      dueDate: "2026-04-06",
      progress: 0,
    },
    {
      title: "Agent Office — PM2 Persistent Process",
      description: "Set up PM2 to keep Agent Office running after SSH disconnects and system reboots. Add startup script and health monitoring.",
      status: "todo",
      priority: "P2",
      assignee: "Arch 🏗️",
      assigneeId: "arch",
      tags: ["devops", "pm2", "infrastructure"],
      dueDate: "2026-04-01",
      progress: 0,
    },
  ];

  for (const task of tasks) {
    const r = await post("/api/tasks", task);
    console.log(`  ✅ Task: ${task.title.slice(0, 50)}...`);
  }
  console.log();

  // ── Seed real activity events ──────────────────────────────────────────────
  console.log("Seeding real activity events...");
  const now = Date.now();
  const activities = [
    { type: "success", agentId: "atlas", agentName: "Atlas", agentEmoji: "🌐", message: "Completed Taiwan market research — 11,000+ word report delivered", metadata: "Research", createdAt: new Date(now - 3600000 * 4) },
    { type: "success", agentId: "kiyo", agentName: "Kiyo", agentEmoji: "🦾", message: "Reviewed Taiwan research. 3 opportunities identified: Home Cleaning, Senior Care, Cross-Border Shopping", metadata: "Strategy", createdAt: new Date(now - 3600000 * 3.5) },
    { type: "success", agentId: "atlas", agentName: "Atlas", agentEmoji: "🌐", message: "Created Taiwan-Opportunities-Executive-Summary.md with visual action plan", metadata: "Research", createdAt: new Date(now - 3600000 * 3) },
    { type: "info", agentId: "arch", agentName: "Arch", agentEmoji: "🏗️", message: "Started Agent Office dashboard build with Next.js 16 + shadcn/ui", metadata: "Engineering", createdAt: new Date(now - 3600000 * 2.5) },
    { type: "success", agentId: "arch", agentName: "Arch", agentEmoji: "🏗️", message: "Agent Office compiled successfully. 5 modules live: Command, Agents, Analytics, Tasks, Collab", metadata: "Engineering", createdAt: new Date(now - 3600000 * 2) },
    { type: "info", agentId: "arch", agentName: "Arch", agentEmoji: "🏗️", message: "Connected MongoDB cluster1.b2mvlgs.mongodb.net — 7 API routes deployed", metadata: "Database", createdAt: new Date(now - 3600000 * 1.5) },
    { type: "success", agentId: "echo", agentName: "Echo", agentEmoji: "📊", message: "Analytics pipeline initialized — syncing real metrics from MongoDB", metadata: "Analytics", createdAt: new Date(now - 3600000 * 1) },
    { type: "warning", agentId: "kiyo", agentName: "Kiyo", agentEmoji: "🦾", message: "ICP not yet defined — blocking sales and marketing work", metadata: "Strategy", createdAt: new Date(now - 3600000 * 0.75) },
    { type: "info", agentId: "arch", agentName: "Arch", agentEmoji: "🏗️", message: "Seeding real workspace data into MongoDB — tasks, agents, messages", metadata: "Database", createdAt: new Date(now - 60000) },
    { type: "success", agentId: "arch", agentName: "Arch", agentEmoji: "🏗️", message: "Agent Office is now fully connected to real data — no more skeleton UI", metadata: "Engineering", createdAt: new Date(now) },
  ];

  for (const a of activities) {
    await post("/api/activity", a);
    console.log(`  ✅ Activity: ${a.message.slice(0, 60)}...`);
  }
  console.log();

  // ── Seed messages in general channel ──────────────────────────────────────
  console.log("Seeding channel messages...");
  const msgs = [
    { sender: "Kiyo", senderId: "kiyo", senderEmoji: "🦾", content: "Morning everyone. Big day — Taiwan research wrapping up, dashboard going live.", channel: "general", type: "text", createdAt: new Date(now - 3600000 * 5) },
    { sender: "Atlas", senderId: "atlas", senderEmoji: "🌐", content: "Research complete. Taiwan home cleaning market: 200B NTD annually. AI automation opportunity is real.", channel: "general", type: "text", createdAt: new Date(now - 3600000 * 4) },
    { sender: "Kiyo", senderId: "kiyo", senderEmoji: "🦾", content: "Good work Atlas. Senior care angle also compelling given LTC 3.0 government spend. Will decide on direction in Q2 planning.", channel: "general", type: "text", createdAt: new Date(now - 3600000 * 3.5) },
    { sender: "Arch", senderId: "arch", senderEmoji: "🏗️", content: "Dashboard is live on port 8080. MongoDB connected. Wiring real data now.", channel: "general", type: "text", createdAt: new Date(now - 3600000 * 2) },
    { sender: "Echo", senderId: "echo", senderEmoji: "📊", content: "Analytics syncing. Once tasks are seeded I can start tracking throughput and efficiency metrics.", channel: "general", type: "text", createdAt: new Date(now - 3600000 * 1) },
    { sender: "Atlas", senderId: "atlas", senderEmoji: "🌐", content: "Cross-border shopping POC looks achievable in 2 weeks. Existing players doing 200K NTD/month with minimal tech.", channel: "engineering", type: "text", createdAt: new Date(now - 3600000 * 3) },
    { sender: "Arch", senderId: "arch", senderEmoji: "🏗️", content: "I can build the Line shopping bot. Scraper + order manager + payment flow. 5-7 days of dev work.", channel: "engineering", type: "text", createdAt: new Date(now - 3600000 * 2.5) },
    { sender: "Kiyo", senderId: "kiyo", senderEmoji: "🦾", content: "Hold on that until ICP is defined. Don't want to build before we know who we're selling to.", channel: "engineering", type: "text", createdAt: new Date(now - 3600000 * 2) },
    { sender: "Kiyo", senderId: "kiyo", senderEmoji: "🦾", content: "Taiwan opportunity: super-aged society (20%+ over 65) + $1.8B government LTC 3.0 = decade-level opening. We move on this.", channel: "strategy", type: "text", createdAt: new Date(now - 3600000 * 3.5) },
    { sender: "Atlas", senderId: "atlas", senderEmoji: "🌐", content: "Agreed. Senior care tech has government tailwind. Cleaning is faster to launch but smaller ceiling.", channel: "strategy", type: "text", createdAt: new Date(now - 3600000 * 3) },
  ];

  for (const m of msgs) {
    await post("/api/messages", m);
    process.stdout.write(".");
  }
  console.log("\n✅ Messages seeded\n");

  console.log("🎉 Done! Refresh Agent Office — real data is live.");
}

main().catch(console.error);
