import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "purple" | "cyan" | "green" | "gray";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gray",
  className = "",
}) => {
  const variantStyles = {
    purple: "bg-purple-950/40 text-purple-300 border-purple-800/40",
    indigo: "bg-indigo-950/40 text-indigo-300 border-indigo-800/40",
    cyan: "bg-cyan-950/40 text-cyan-300 border-cyan-800/40",
    green: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
    gray: "bg-neutral-900 text-neutral-300 border-neutral-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
