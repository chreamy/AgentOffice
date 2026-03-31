import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "./nav";

export const metadata: Metadata = {
  title: "Agent Office | Multi-Agent Chat",
  description: "Multi-agent chat dashboard powered by Moonshot AI",
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
