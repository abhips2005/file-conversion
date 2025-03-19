"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  FileIcon, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  Zap
} from "lucide-react"
import ChatComponent from "@/components/ChatComponent"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              NeoConvert Hub
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Advanced file conversion with AI assistance. Transform your files between formats through intelligent conversation.
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center text-slate-700 dark:text-slate-300 mb-6">
                <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">AI Conversion Assistant</h2>
              </div>
              <ChatComponent />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Feature Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Conversational Conversion" 
            description="Upload, convert, and download files by simply chatting with our AI"
            icon={<FileIcon className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-lg" />}
          />
          <FeatureCard 
            title="Smart Format Selection" 
            description="AI helps you choose the optimal format based on your needs"
            icon={<Sparkles className="h-10 w-10 p-2 bg-purple-100 text-purple-600 rounded-lg" />}
          />
          <FeatureCard 
            title="Conversion Memory" 
            description="The assistant remembers your conversions for seamless follow-ups"
            icon={<Zap className="h-10 w-10 p-2 bg-green-100 text-green-600 rounded-lg" />}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-10 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© 2025 NeoConvert Hub. All rights reserved.</p>
          <p className="mt-2">Powered by Next.js, React, and Cloudmersive API</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
    </motion.div>
  )
}

