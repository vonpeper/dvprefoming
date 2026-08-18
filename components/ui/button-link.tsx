import React from "react";
import Link from "next/link";

interface ButtonLinkProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function ButtonLink({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: ButtonLinkProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans text-[11px] uppercase tracking-[0.18em] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none border-0";

  const variants = {
    primary:
      "px-6 py-3.5 bg-accent-red text-text-main border-2 border-accent-red hover:bg-transparent hover:text-accent-red",
    secondary:
      "px-6 py-3.5 bg-transparent text-text-main border-2 border-border-editorial-light hover:border-text-main",
    text:
      "py-2 bg-transparent text-accent-red hover:text-text-main tracking-widest",
  };

  const content = (
    <>
      <span>{children}</span>
      {variant === "text" && (
        <span className="ml-1 transform transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
          &rarr;
        </span>
      )}
    </>
  );

  const isLink = href !== undefined;

  if (isLink) {
    return (
      <Link
        href={href}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        className={`${baseStyles} ${variants[variant]} group ${className}`}
        aria-disabled={disabled}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} group ${className}`}
    >
      {content}
    </button>
  );
}
