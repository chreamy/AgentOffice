# 🏢 Agent Office

A sophisticated, modern AI agent collaboration hub built with Next.js. Inspired by Star-Office-UI but reimagined with a sleek, glassmorphism aesthetic and powerful analytics features.

![Agent Office Dashboard](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## 🌟 Features

### Core Experience
- **🎯 Command Center** - Real-time overview of all agent activities and system status
- **🏗️ Agent Presence Panel** - Live location tracking with 3D-style avatars and status indicators
- **📊 Analytics Observatory** - Deep insights into agent performance, system health, and cost analysis
- **✅ Task Command** - Full-featured task management with priority queues and progress tracking
- **💬 Collaboration Hub** - Real-time messaging, file sharing, and meeting coordination

### Visual Design
- **Glassmorphism UI** - Modern frosted glass aesthetic with backdrop filters
- **Dark/Light Themes** - Seamless theme switching with next-themes
- **Animated Transitions** - Smooth Framer Motion animations throughout
- **Responsive Layout** - Works beautifully on desktop, tablet, and mobile
- **Custom Scrollbars** - Styled scrollbars matching the design system

### Analytics & Insights
- **Performance Metrics** - Track tasks completed, response times, efficiency ratings
- **System Health** - Monitor CPU, memory, API usage in real-time
- **Cost Analysis** - Break down spending by service and agent
- **Visual Charts** - Recharts-powered bar, line, area, and pie charts
- **AI Insights** - Smart observations about team performance

### Collaboration Tools
- **Multi-Channel Chat** - Public, private, and direct message channels
- **File Sharing** - Shared workspace for documents and resources
- **Meeting Integration** - Active meeting display with join capabilities
- **Activity Feed** - Real-time stream of all agent actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd agent-office

# Install dependencies
npm install

# Run development server on port 8080
npm run dev

# Or build for production
npm run build
npm start
```

The application will be available at `http://localhost:8080`

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State**: React hooks + Zustand (ready)
- **Theme**: next-themes

### Project Structure
```
agent-office/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── page.tsx         # Main dashboard
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── header.tsx       # Top navigation
│   │   ├── sidebar.tsx      # Left navigation
│   │   ├── command-center.tsx      # Main dashboard view
│   │   ├── agent-presence-panel.tsx # Agent tracking
│   │   ├── analytics-observatory.tsx # Data visualization
│   │   ├── task-command.tsx         # Task management
│   │   ├── collaboration-hub.tsx    # Chat & messaging
│   │   └── activity-feed.tsx        # Activity stream
│   └── lib/
│       └── utils.ts         # Utility functions
├── TODO.md                  # Feature roadmap
└── package.json
```

## 👥 The Agent Team

| Agent | Emoji | Role | Specialty |
|-------|-------|------|-----------|
| Kiyo | 🦾 | CEO & Chief Orchestrator | Strategy, Architecture, Leadership |
| Arch | 🏗️ | Senior Developer & System Architect | Full-Stack, DevOps, Debugging |
| Nova | ✨ | Creative Director & UX Lead | Design, UX, Branding |
| Atlas | 🌐 | Research Lead & Knowledge Curator | Research, Analysis, Documentation |
| Echo | 📊 | Data Analyst & Reporting Specialist | Analytics, SQL, Visualization |

## 🗺️ Office Zones

- **🧠 Command Center** - Strategic oversight (Kiyo)
- **💻 Engineering Bay** - Development & infrastructure (Arch)
- **🎨 Design Studio** - Creative work & UX (Nova)
- **📚 Knowledge Library** - Research & documentation (Atlas)
- **📈 Analytics Lab** - Data analysis & reporting (Echo)

## 📋 Feature Roadmap

See [TODO.md](./TODO.md) for the complete feature list with 120+ planned features.

### Phase 1: Foundation ✅
- Next.js setup with TypeScript
- Tailwind CSS and shadcn/ui integration
- Theme system (dark/light)
- Core layout and navigation

### Phase 2: Agent Presence 🚧
- Live agent avatars and status
- Office zone visualization
- Real-time location tracking

### Phase 3: Analytics 📊
- Performance dashboards
- System health monitoring
- Cost tracking and insights

### Phase 4: Tasks & Collaboration
- Full task management
- Real-time messaging
- File sharing

### Phase 5: Advanced Features
- WebSocket real-time updates
- External integrations
- Mobile optimization

## 🎨 Design System

### Colors
- Primary: Blue gradient (`from-blue-500 to-purple-600`)
- Success: Green (`#10b981`)
- Warning: Amber (`#f59e0b`)
- Error: Red (`#ef4444`)
- Background: Dark mode with subtle grid pattern

### Typography
- Font: Geist (sans) + Geist Mono
- Scale: Tailwind's default with custom adjustments

### Effects
- Glassmorphism: `backdrop-filter: blur(10px)`
- Glow effects for status indicators
- Smooth transitions on all interactive elements
- Pulse animations for online/busy states

## 🛠️ Development

### Adding New Components
```bash
npx shadcn@latest add <component-name>
```

### Customizing Themes
Edit `src/app/globals.css` to modify CSS variables for colors, spacing, and effects.

### Adding New Agents
Update the agent arrays in:
- `src/components/command-center.tsx`
- `src/components/agent-presence-panel.tsx`
- `src/components/analytics-observatory.tsx`

## 📈 Future Enhancements

- **WebSocket Integration** - True real-time updates
- **Backend API** - Persistent data storage
- **Authentication** - Secure agent login
- **Plugin System** - Extensible architecture
- **Mobile App** - React Native companion
- **Voice Mode** - Text-to-speech announcements
- **AI Integration** - Smart task suggestions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this for your own agent teams!

## 🙏 Credits

Inspired by [Star-Office-UI](https://github.com/ringhyacinth/Star-Office-UI) - a pixel-art office dashboard for OpenClaw. This project reimagines that concept with a modern, sophisticated aesthetic.

---

Built with ❤️ by Arch 🏗️ and the Agent Office team
