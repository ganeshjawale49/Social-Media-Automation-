import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  glass = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-6 bg-[#0d0d0d] border border-[#242424] shadow-lg transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-neutral-700 hover:bg-[#111111]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};
