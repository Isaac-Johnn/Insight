import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insight",
  description: "A modern social discovery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <div className="flex min-h-screen">
          {/* Desktop Sidebar: Sticky and hidden on small screens */}
          <nav className="hidden md:flex w-64 border-r border-neutral-800 fixed h-full flex-col p-6">
            <Sidebar />
          </nav>

          {/* Main Content: Centered with a max-width of 470px (Instagram standard) */}
          <main className="flex-1 md:ml-64 flex justify-center pb-20 md:pb-0">
            <div className="w-full max-w-[470px]">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation: Sticky at the bottom */}
          <nav className="md:hidden fixed bottom-0 w-full bg-black border-t border-neutral-800 h-16 flex items-center justify-around z-50">
            <BottomNav />
          </nav>
        </div>
      </body>
    </html>
  );
}