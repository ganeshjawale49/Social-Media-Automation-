import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const isPasswordType = type === "password";
  const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-neutral-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={inputId}
          type={actualType}
          className={`w-full px-4 py-2.5 bg-[#141414] border ${
            error
              ? "border-red-700/80 focus:border-red-500 focus:ring-red-500/20"
              : "border-[#242424] focus:border-white focus:ring-white/20"
          } ${
            isPasswordType ? "pr-10" : ""
          } rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors focus:outline-none p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};
