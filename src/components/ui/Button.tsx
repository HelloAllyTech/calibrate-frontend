"use client";

import React from "react";
import { SpinnerIcon } from "@/components/icons";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 transition-opacity",
  secondary:
    "border border-border bg-background hover:bg-muted/50 transition-colors",
  danger:
    "bg-red-800 text-white hover:bg-red-900 transition-colors",
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  isLoading = false,
  loadingText,
  type = "button",
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        rounded-md font-medium cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isLoading && <SpinnerIcon className="w-4 h-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
