import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { ClerkProvider, UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Deep Minds - AI Domain Generator",
  description: "Your AI-powered creative partner for finding perfect domain names",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider>
          {/* Top Navigation Bar */}
          <nav className="w-full bg-white/80 dark:bg-gray-900/80 shadow-md sticky top-0 z-50 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
              {/* Left: Logo and App Name */}
              <Link href="/" className="flex items-center gap-3 select-none group">
                <Image src="/ai-avatar.png" alt="Deep Minds Logo" width={36} height={36} className="w-9 h-9 rounded-full shadow-md group-hover:scale-110 transition-transform duration-200" />
                <span className="font-extrabold text-2xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg">Deep Minds</span>
              </Link>
              {/* Center: Nav Links */}
              <div className="flex gap-6 items-center text-base font-semibold">
                <Link href="/" className="nav-link text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
                <Link href="/about" className="nav-link text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
                <Link href="/pricing" className="nav-link text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition">Pricing</Link>
              </div>
              {/* Right: Sign In/Out */}
              <div className="flex items-center gap-2">
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 text-white font-bold px-4 py-2 shadow hover:scale-105 transition-transform duration-200">Sign In</button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </nav>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
