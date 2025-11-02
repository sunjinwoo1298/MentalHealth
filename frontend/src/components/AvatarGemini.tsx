import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AvatarGemini({ name = "User" }: { name?: string }) {
  return (
    <div className="relative inline-flex items-center">
      <motion.div
        className="absolute -inset-3 rounded-full bg-joy-gradient bg-[length:200%_200%] opacity-70"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        aria-hidden
      />
      <img
        src="./logo.jpg"
        alt="Gemini AI Avatar"
        className="relative size-16 md:size-20 rounded-2xl shadow-bubbly border-2 border-white"
      />
      <div className="ml-3 z-10">
        <div className="flex items-center gap-2 text-xl md:text-2xl font-extrabold tracking-tight">
          Hi {name}! <Sparkles className="size-5 text-amber-500" aria-hidden />
        </div>
      </div>
    </div>
  );
}
