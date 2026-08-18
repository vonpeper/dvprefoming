import React from "react";
import { EntityStatus } from "@/types/mock";

interface EditorialLabelProps {
  status?: EntityStatus | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT";
  text?: string;
  variant?: "default" | "accent" | "outline" | "danger" | "warning";
  className?: string;
}

export default function EditorialLabel({
  status,
  text,
  variant = "default",
  className = "",
}: EditorialLabelProps) {
  let labelText = text || "";
  let computedVariant = variant;

  if (status) {
    switch (status) {
      case "DRAFT":
        labelText = "BORRADOR";
        computedVariant = "warning";
        break;
      case "PLACEHOLDER":
        labelText = "PLACEHOLDER";
        computedVariant = "outline";
        break;
      case "PENDING_CLIENT_INPUT":
        labelText = "PENDIENTE DE CLIENTE";
        computedVariant = "outline";
        break;
      case "PENDING_REVIEW":
        labelText = "PENDIENTE";
        computedVariant = "warning";
        break;
      case "APPROVED":
        labelText = "APROBADO";
        computedVariant = "default";
        break;
      case "REJECTED":
        labelText = "RECHAZADO";
        computedVariant = "danger";
        break;
      case "PUBLISHED":
        labelText = "PUBLICADO";
        computedVariant = "accent";
        break;
    }
  }

  const baseStyles =
    "inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase border transition-colors duration-200";
  
  const variantStyles = {
    default:
      "border-text-main/20 bg-text-main/5 text-text-main",
    accent:
      "border-accent-red/30 bg-accent-red/10 text-accent-red",
    outline:
      "border-border-editorial bg-transparent text-text-muted",
    danger:
      "border-red-500/30 bg-red-500/10 text-red-400",
    warning:
      "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[computedVariant]} ${className}`}
      aria-label={`Etiqueta: ${labelText}`}
    >
      {labelText}
    </span>
  );
}
