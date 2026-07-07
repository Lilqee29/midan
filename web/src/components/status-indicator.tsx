"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";

interface StatusIndicatorProps {
  status: string;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case "completed":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-100",
          label: "Completed",
        };
      case "in_progress":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          label: "In Progress",
        };
      case "blocked":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          label: "Blocked",
        };
      case "review":
        return {
          icon: FileText,
          color: "text-blue-600",
          bg: "bg-blue-100",
          label: "Review",
        };
      case "cancelled":
        return {
          icon: AlertCircle,
          color: "text-gray-500",
          bg: "bg-gray-100",
          label: "Cancelled",
        };
      default:
        return {
          icon: FileText,
          color: "text-gray-600",
          bg: "bg-gray-100",
          label: "Todo",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </motion.div>
  );
}
