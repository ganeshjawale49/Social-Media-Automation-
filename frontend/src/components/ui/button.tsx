import React from "react";
import { Spinner } from "./spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-white hover:bg-neutral-200 text-black font-semibold border border-white focus:ring-white",
    secondary:
      "bg-[#0d0d0d] hover:bg-[#161616] text-white border border-[#242424] focus:ring-neutral-700",
    danger:
      "bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/60 focus:ring-red-700",
    ghost:
      "bg-transparent hover:bg-neutral-900 text-neutral-300 hover:text-white focus:ring-neutral-800",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-1.5" />}
      {children}
    </button>
  );
};
