import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-10 flex flex-col gap-6 items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent drop-shadow-xl text-center mb-2">About Me</h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 text-center font-medium">
          Hi! I&apos;m <span className="font-bold">Lakshman Jamili</span>, the creator of <span className="font-bold">Loukri AI</span>&mdash;your creative partner for finding the perfect, brandable .com domain names. My journey in AI and GenAI began over a decade ago, working passionately in the healthcare space to make a real difference. For the past 10 years, I&apos;ve poured my heart and soul into this field, often working 15-hour days, driven by a desire to help others and push the boundaries of what&apos;s possible.
        </p>
        <p className="text-base text-gray-600 dark:text-gray-300 text-center">
          As a proud parent and a family of four, my dream is to achieve financial freedom and create a better future for my loved ones. <span className="font-bold">Loukri AI</span> is more than just a project&mdash;it&apos;s a piece of my heart, named by combining the names of my two wonderful kids. Every line of code, every feature, is built with love, hope, and the belief that technology can empower people to live better, more inspired lives.
        </p>
        <p className="text-base text-gray-600 dark:text-gray-300 text-center">
          My mission is to build intelligent agents that help individuals speed up their day-to-day lives, making branding and domain discovery accessible, fun, and truly inspiring for everyone. Thank you for being a part of this journey. Your support means the world to me and my family.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Connect with me:</span>
          <div className="flex gap-4">
            <a href="https://github.com/lakshmanjamili" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">GitHub</a>
            <a href="mailto:lakshmanjamili@gmail.com" className="text-purple-600 hover:underline font-semibold">Email</a>
            <a href="https://www.linkedin.com/in/lakshmanjamili/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline font-semibold">LinkedIn</a>
          </div>
        </div>
        <Link href="/" className="mt-6 text-blue-600 hover:underline font-bold">← Back to Home</Link>
      </div>
    </div>
  );
} 