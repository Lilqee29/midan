"use client";

import { motion } from "framer-motion";

interface ConfidenceMeterProps {
  confidence: number;
  className?: string;
}

export function ConfidenceMeter({
  confidence,
  className,
}: ConfidenceMeterProps) {
  const percentage = Math.round(confidence * 100);

  const getColor = (conf: number) => {
    if (conf >= 0.8) return "bg-green-500";
    if (conf >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLabel = (conf: number) => {
    if (conf >= 0.8) return "High";
    if (conf >= 0.5) return "Medium";
    return "Low";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className={`h-full rounded-full ${getColor(confidence)}`}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium w-12">
        {getLabel(confidence)}
      </span>
    </div>
  );
}
