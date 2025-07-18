import React from "react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-10 flex flex-col gap-8 items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent drop-shadow-xl text-center mb-2">Pricing</h1>
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
          <div className="flex-1 bg-blue-50 dark:bg-gray-800 rounded-2xl p-6 shadow-md flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">Free Tier</h2>
            <p className="text-gray-700 dark:text-gray-200 text-center mb-4">Try out Loukri AI with up to <span className="font-semibold">5 chats</span> as a guest. No login required!</p>
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-200 mb-2">$0</span>
            <span className="text-xs text-gray-500">No credit card needed</span>
          </div>
          <div className="flex-1 bg-purple-50 dark:bg-gray-800 rounded-2xl p-6 shadow-md flex flex-col items-center">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">Pro Tier</h2>
            <p className="text-gray-700 dark:text-gray-200 text-center mb-4">Unlimited chats, save your conversations, and get priority support. <span className="font-semibold">Sign in to unlock!</span></p>
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-200 mb-2">Free (for now!)</span>
            <span className="text-xs text-gray-500">Sign in to access</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 mt-6">
          <span className="text-base text-gray-700 dark:text-gray-200 font-medium">Like Loukri AI? Support us!</span>
          <a href="https://www.buymeacoffee.com/lakshmanjamili" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full shadow transition-all duration-200">☕ Buy Me a Coffee</a>
        </div>
        <Link href="/" className="mt-6 text-blue-600 hover:underline font-bold">← Back to Home</Link>
      </div>
    </div>
  );
} 