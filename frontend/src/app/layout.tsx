import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "./nav";

export const metadata: Metadata = {
  title: "OpenClaw Dashboard | Agent Activity Tracker",
  description:
    "Real-time OpenClaw agent activity dashboard with WebSocket streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased bg-[#0a0e1a] text-gray-100 min-h-screen flex flex-col font-[system-ui,-apple-system,sans-serif]">
        <Nav />
        <main className="flex-1 overflow-auto pb-20 sm:pb-6">{children}</main>
      </body>
    </html>
  );
}
