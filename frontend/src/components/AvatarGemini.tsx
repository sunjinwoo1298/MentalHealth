import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AvatarGemini({ name = "Tarang" }: { name?: string }) {
  return (
    <div className="relative inline-flex items-center">
      <motion.div
        className="absolute -inset-3 rounded-full bg-joy-gradient bg-[length:200%_200%] opacity-70"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        aria-hidden
      />
      <img
        src="https://api.dicebear.com/9.x/bottts/svg?colors=purple,blue,green&mouth=smile&eyes=happy"
        alt="Gemini AI Avatar"
        className="relative size-16 md:size-20 rounded-2xl shadow-bubbly border-2 border-white"
      />
      <div className="ml-3">
        <div className="text-sm text-muted-foreground">Gemini</div>
        <div className="flex items-center gap-2 text-xl md:text-2xl font-extrabold tracking-tight">
          Hi {name}! <Sparkles className="size-5 text-amber-500" aria-hidden />
        </div>
      </div>
    </div>
  );
}
